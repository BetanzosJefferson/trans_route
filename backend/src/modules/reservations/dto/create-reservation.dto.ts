import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ description: 'ID del segmento de viaje' })
  @IsUUID()
  trip_segment_id: string;

  @ApiProperty({ description: 'ID del cliente' })
  @IsUUID()
  client_id: string;

  @ApiProperty({ description: 'Número de asientos a reservar', minimum: 1 })
  @IsInt()
  @Min(1)
  @Max(50)
  seats_reserved: number;

  @ApiProperty({ description: 'Monto total de la reserva' })
  @IsNumber()
  @Min(0)
  total_amount: number;

  @ApiProperty({
    description: 'Estado del pago',
    enum: ['pending', 'partial', 'paid'],
  })
  @IsEnum(['pending', 'partial', 'paid'])
  payment_status: 'pending' | 'partial' | 'paid';

  @ApiProperty({
    description:
      'Monto pagado (para anticipo o pago completo)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  amount_paid?: number;

  @ApiProperty({
    description: 'Método de pago',
    enum: ['cash', 'card', 'transfer'],
    required: false,
  })
  @IsEnum(['cash', 'card', 'transfer'])
  @IsOptional()
  payment_method?: 'cash' | 'card' | 'transfer';

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
