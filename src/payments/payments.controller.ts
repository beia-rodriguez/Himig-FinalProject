import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Endpoint 17: Protected - Submit a payment record for an order
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req: any) {
    return this.paymentsService.create(createPaymentDto, req.user.userId);
  }

  // Endpoint 18: Protected (Buyer/Seller/Admin) - Get payments for an order
  @Get('order/:orderId')
  findByOrder(@Param('orderId', ParseIntPipe) orderId: number, @Request() req: any) {
    return this.paymentsService.findByOrder(orderId, req.user.userId, req.user.role);
  }
}