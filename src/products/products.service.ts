import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private products: Product[] = [];
  private idSeq = 1;

  create(dto: CreateProductDto): Product {
    const product: Product = { id: this.idSeq++, ...dto };
    this.products.push(product);
    return product;
  }

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product {
    const prod = this.products.find(p => p.id === id);
    if (!prod) throw new NotFoundException(`Producto ${id} no encontrado`);
    return prod;
  }

  update(id: number, dto: UpdateProductDto): Product {
    const prod = this.findOne(id);
    const updated = { ...prod, ...dto };
    this.products = this.products.map(p => (p.id === id ? updated : p));
    return updated;
  }

  remove(id: number): void {
    this.findOne(id); // valida existencia
    this.products = this.products.filter(p => p.id !== id);
  }
}

