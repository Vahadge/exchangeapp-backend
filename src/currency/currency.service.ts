import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RootConfig } from '../config/configuration.js';
import type {
  ConversionResult,
  ConversionType,
  Currency,
  ExchangeRate,
} from './currency.types.js';
import type {
  FreeCurrencyApiCurrenciesResponse,
  FreeCurrencyApiHistoricalResponse,
  FreeCurrencyApiLatestResponse,
  FreeCurrencyApiValidationErrorResponse,
} from './interfaces/free-currency-api.interface.js';

const API_BASE_URL = 'https://api.freecurrencyapi.com/v1';

function isValidationErrorResponse(
  body: unknown,
): body is FreeCurrencyApiValidationErrorResponse {
  if (typeof body !== 'object' || body === null) {
    return false;
  }
  return (
    'errors' in body &&
    typeof (body as Record<string, unknown>).errors === 'object'
  );
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private readonly apiKey: string;

  constructor(configService: ConfigService<RootConfig, true>) {
    this.apiKey = configService.get('app.freeCurrencyApiKey', { infer: true });
  }

  async getCurrencies(): Promise<Currency[]> {
    const response =
      await this.request<FreeCurrencyApiCurrenciesResponse>('/currencies');

    if (typeof response.data !== 'object' || response.data === null) {
      throw new BadGatewayException(
        'Currency provider returned an unexpected currency list',
      );
    }

    return Object.values(response.data).map((currency) => ({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      decimalDigits: currency.decimal_digits,
    }));
  }

  async getLatestRate(
    baseCurrency: string,
    targetCurrency: string,
  ): Promise<ExchangeRate> {
    const response = await this.request<FreeCurrencyApiLatestResponse>(
      '/latest',
      {
        base_currency: baseCurrency,
        currencies: targetCurrency,
      },
    );

    const rate = response.data?.[targetCurrency];
    if (typeof rate !== 'number') {
      throw new BadGatewayException(
        'Currency provider did not return the requested rate',
      );
    }

    return {
      baseCurrency,
      targetCurrency,
      rate,
      date: new Date().toISOString().slice(0, 10),
    };
  }

  async getHistoricalRate(
    baseCurrency: string,
    targetCurrency: string,
    date: string,
  ): Promise<ExchangeRate> {
    const response = await this.request<FreeCurrencyApiHistoricalResponse>(
      '/historical',
      {
        base_currency: baseCurrency,
        currencies: targetCurrency,
        date,
      },
    );

    const rate = response.data?.[date]?.[targetCurrency];
    if (typeof rate !== 'number') {
      throw new BadGatewayException(
        'Currency provider did not return the requested historical rate',
      );
    }

    return { baseCurrency, targetCurrency, rate, date };
  }

  async convert(
    amount: number,
    from: string,
    to: string,
  ): Promise<ConversionResult> {
    const exchangeRate = await this.getLatestRate(from, to);
    return this.buildConversionResult(amount, exchangeRate, 'latest');
  }

  async convertHistorical(
    amount: number,
    from: string,
    to: string,
    date: string,
  ): Promise<ConversionResult> {
    const exchangeRate = await this.getHistoricalRate(from, to, date);
    return this.buildConversionResult(amount, exchangeRate, 'historical');
  }

  private buildConversionResult(
    amount: number,
    exchangeRate: ExchangeRate,
    type: ConversionType,
  ): ConversionResult {
    return {
      amount,
      from: exchangeRate.baseCurrency,
      to: exchangeRate.targetCurrency,
      rate: exchangeRate.rate,
      convertedAmount: this.round(amount * exchangeRate.rate),
      date: exchangeRate.date,
      type,
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private async request<T>(
    path: string,
    params: Record<string, string> = {},
  ): Promise<T> {
    const url = new URL(`${API_BASE_URL}${path}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { apikey: this.apiKey },
      });
    } catch {
      throw new ServiceUnavailableException(
        'Unable to reach currency provider',
      );
    }

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new BadGatewayException(
        'Received a malformed response from currency provider',
      );
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    switch (response.status) {
      case 401:
      case 403:
        this.logger.error(
          `Currency provider rejected the request (status ${response.status})`,
        );
        throw new HttpException(
          'Currency service is not configured correctly',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      case 422: {
        const message =
          this.extractValidationMessage(body) ??
          'Invalid currency or date supplied';
        throw new BadRequestException(message);
      }
      case 429:
        throw new HttpException(
          'Currency provider rate limit exceeded, please try again later',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      default:
        this.logger.error(
          `Currency provider request failed with status ${response.status}`,
        );
        throw new BadGatewayException(
          'Currency provider is currently unavailable',
        );
    }
  }

  private extractValidationMessage(body: unknown): string | undefined {
    if (!isValidationErrorResponse(body)) {
      return undefined;
    }
    const [firstField] = Object.keys(body.errors);
    return firstField ? body.errors[firstField]?.[0] : undefined;
  }
}
