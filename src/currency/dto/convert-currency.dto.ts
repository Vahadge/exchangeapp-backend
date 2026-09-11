import { Transform } from 'class-transformer';
import { IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class ConvertCurrencyDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @Length(3, 3)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  from!: string;

  @IsString()
  @Length(3, 3)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  to!: string;
}
