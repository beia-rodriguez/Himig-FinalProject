import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, sellerId: number): Promise<Product> {
    const product = this.productsRepository.create({
      ...createProductDto,
      price: createProductDto.price.toFixed(2),
      seller: { id: sellerId } as User,
    });

    const saved = await this.productsRepository.save(product);
    return this.findOne(saved.id);
  }

  async findAll(filterDto: FilterProductDto) {
    const {
      category,
      artistName,
      itemCondition,
      productStatus,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 10,
    } = filterDto;

    const query = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller')
      .orderBy('product.createdAt', 'DESC');

    if (category) {
      query.andWhere('product.category = :category', { category });
    }

    if (artistName) {
      query.andWhere('product.artistName LIKE :artistName', {
        artistName: `%${artistName}%`,
      });
    }

    if (itemCondition) {
      query.andWhere('product.itemCondition = :itemCondition', { itemCondition });
    }

    if (productStatus) {
      query.andWhere('product.productStatus = :productStatus', { productStatus });
    }

    if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (search) {
      query.andWhere(
        '(product.productName LIKE :search OR product.artistName LIKE :search OR product.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { seller: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySeller(sellerId: number): Promise<Product[]> {
    return this.productsRepository.find({
      where: { seller: { id: sellerId } },
      relations: { seller: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    userId: number,
    userRole: UserRole,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (product.seller.id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own product listings');
    }

    if (
      product.productStatus === ProductStatus.SOLD ||
      product.productStatus === ProductStatus.TRADED
    ) {
      throw new BadRequestException(
        `Cannot modify a product that is already ${product.productStatus}`,
      );
    }

    const { price, ...rest } = updateProductDto;
    Object.assign(product, rest);

    if (price !== undefined) {
      product.price = price.toFixed(2);
    }

    await this.productsRepository.save(product);
    return this.findOne(id);
  }

  async remove(id: number, userId: number, userRole: UserRole): Promise<{ message: string }> {
    const product = await this.findOne(id);

    if (product.seller.id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own product listings');
    }

    if (product.productStatus === ProductStatus.RESERVED) {
      throw new BadRequestException('Cannot delete a product with an active reservation');
    }

    // Uses @DeleteDateColumn() for soft deletion so historical orders/trades stay intact
    await this.productsRepository.softRemove(product);
    return { message: `Product #${id} has been removed` };
  }
}