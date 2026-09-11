import { IsString, Matches } from 'class-validator';
import { ConvertCurrencyDto } from './convert-currency.dto.js';

export class ConvertHistoricalCurrencyDto extends ConvertCurrencyDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date!: string;
}
