import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrencyService } from './currency.service.js';
import { ConvertCurrencyDto } from './dto/convert-currency.dto.js';
import { ConvertHistoricalCurrencyDto } from './dto/convert-historical-currency.dto.js';
import type { ConversionResult, Currency } from './currency.types.js';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('currencies')
  getCurrencies(): Promise<Currency[]> {
    return this.currencyService.getCurrencies();
  }

  @Post('convert')
  convert(@Body() body: ConvertCurrencyDto): Promise<ConversionResult> {
    return this.currencyService.convert(body.amount, body.from, body.to);
  }

  @Post('historical')
  convertHistorical(
    @Body() body: ConvertHistoricalCurrencyDto,
  ): Promise<ConversionResult> {
    return this.currencyService.convertHistorical(
      body.amount,
      body.from,
      body.to,
      body.date,
    );
  }
}
