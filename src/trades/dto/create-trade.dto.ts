import { IsInt, IsPositive } from 'class-validator';

export class CreateTradeDto {
  @IsInt()
  @IsPositive()
  offeredProductId: number;

  @IsInt()
  @IsPositive()
  requestedProductId: number;
}