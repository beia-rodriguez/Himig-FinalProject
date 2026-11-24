import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Endpoint 7: Public - Browse and filter listings
  @Get()
  findAll(@Query() filterDto: FilterProductDto) {
    return this.productsService.findAll(filterDto);
  }

  // Endpoint 9: Public - Get all listings by a specific seller
  @Get('seller/:sellerId')
  findBySeller(@Param('sellerId', ParseIntPipe) sellerId: number) {
    return this.productsService.findBySeller(sellerId);
  }

  // Endpoint 8: Public - Get single product details
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // Endpoint 10: Protected - Create a new listing
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    return this.productsService.create(createProductDto, req.user.userId);
  }

  // Endpoint 11: Protected (Owner/Admin) - Update a listing
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ) {
    return this.productsService.update(
      id,
      updateProductDto,
      req.user.userId,
      req.user.role,
    );
  }

  // Endpoint 12: Protected (Owner/Admin) - Soft-delete a listing
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.productsService.remove(id, req.user.userId, req.user.role);
  }
}