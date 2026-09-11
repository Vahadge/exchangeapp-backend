export interface FreeCurrencyApiCurrency {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
  type: string;
}

export interface FreeCurrencyApiCurrenciesResponse {
  data: Record<string, FreeCurrencyApiCurrency>;
}

export interface FreeCurrencyApiLatestResponse {
  data: Record<string, number>;
}

export interface FreeCurrencyApiHistoricalResponse {
  data: Record<string, Record<string, number>>;
}

export interface FreeCurrencyApiValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}
