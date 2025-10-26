import { IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPaymentDto {
  @ApiProperty({
    description: 'Monto del pago a agregar',
    example: 150.00,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Método de pago',
    enum: ['cash', 'transfer', 'card'],
    example: 'transfer',
  })
  @IsEnum(['cash', 'transfer', 'card'])
  paymentMethod: 'cash' | 'transfer' | 'card';
}

