import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  // Endpoint 19: Protected (Seller/Admin) - Create shipment tracking
  @Post()
  create(@Body() createShipmentDto: CreateShipmentDto, @Request() req: any) {
    return this.shipmentsService.create(createShipmentDto, req.user.userId, req.user.role);
  }

  // Endpoint 20: Protected (Seller/Admin) - Update shipment tracking/status
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShipmentDto: UpdateShipmentDto,
    @Request() req: any,
  ) {
    return this.shipmentsService.update(id, updateShipmentDto, req.user.userId, req.user.role);
  }
}