export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalDigits: number;
}

export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  date: string;
}

export type ConversionType = 'latest' | 'historical';

export interface ConversionResult {
  amount: number;
  from: string;
  to: string;
  rate: number;
  convertedAmount: number;
  date: string;
  type: ConversionType;
}
