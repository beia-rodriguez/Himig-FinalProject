import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeStatusDto } from './dto/update-trade-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  // Endpoint 21: Protected - Propose an item-for-item trade
  @Post()
  create(@Body() createTradeDto: CreateTradeDto, @Request() req: any) {
    return this.tradesService.create(createTradeDto, req.user.userId);
  }

  // Endpoint 22: Protected - View sent and received trade offers
  @Get('my-trades')
  findMyTrades(@Request() req: any) {
    return this.tradesService.findMyTrades(req.user.userId);
  }

  // Endpoint 23: Protected - Accept, reject, cancel, or complete a trade
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTradeStatusDto,
    @Request() req: any,
  ) {
    return this.tradesService.updateStatus(
      id,
      updateDto,
      req.user.userId,
      req.user.role,
    );
  }
}