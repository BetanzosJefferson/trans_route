import { IsUUID, IsNumber, IsString, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelReservationDto {
  @ApiProperty({
    description: 'Monto a reembolsar (0 si no hay reembolso)',
    example: 250.50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  refundAmount: number;

  @ApiProperty({
    description: 'Razón de la cancelación',
    example: 'Cliente solicitó cancelación por enfermedad',
  })
  @IsString()
  cancellationReason: string;

  @ApiProperty({
    description: 'Método de pago para el reembolso',
    enum: ['cash', 'transfer', 'card'],
    example: 'cash',
  })
  @IsEnum(['cash', 'transfer', 'card'])
  paymentMethod: 'cash' | 'transfer' | 'card';
}

