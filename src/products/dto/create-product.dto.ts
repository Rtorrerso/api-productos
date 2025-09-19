import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Café latte' })
  @IsString()
  name: string;

  @ApiProperty({ example: 3.5 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 'Bebida caliente', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
