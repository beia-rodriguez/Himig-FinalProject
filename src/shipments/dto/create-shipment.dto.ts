import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingStatus } from '../entities/shipment.entity';

export class CreateShipmentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orderId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  courierName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;

  @IsOptional()
  @IsEnum(ShippingStatus)
  shippingStatus?: ShippingStatus;
}