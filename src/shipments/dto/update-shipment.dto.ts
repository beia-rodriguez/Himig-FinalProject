import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ShippingStatus } from '../entities/shipment.entity';

export class UpdateShipmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  courierName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string;

  @IsOptional()
  @IsEnum(ShippingStatus)
  shippingStatus?: ShippingStatus;
}