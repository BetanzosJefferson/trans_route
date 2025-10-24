import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../../../shared/enums/payment-status.enum';
import { ReservationStatus } from '../../../shared/enums/reservation-status.enum';

class PassengerDto {
  @ApiProperty({ description: 'Nombre del pasajero' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'Apellido del pasajero' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ description: 'Edad del pasajero', required: false })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({ description: 'Tipo de documento', required: false })
  @IsOptional()
  @IsString()
  document_type?: string;

  @ApiProperty({ description: 'Número de documento', required: false })
  @IsOptional()
  @IsString()
  document_number?: string;

  @ApiProperty({ description: 'Número de asiento', required: false })
  @IsOptional()
  @IsString()
  seat_number?: string;
}

export class CreateReservationDto {
  @ApiProperty({ description: 'ID del cliente' })
  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({ description: 'ID del segmento de viaje' })
  @IsUUID()
  @IsNotEmpty()
  trip_segment_id: string;

  @ApiProperty({ description: 'Número de asientos reservados', default: 1 })
  @IsNumber()
  @IsNotEmpty()
  seats_reserved: number;

  @ApiProperty({ description: 'Monto total' })
  @IsNumber()
  @IsNotEmpty()
  total_amount: number;

  @ApiProperty({ description: 'Estado de pago', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  payment_status?: PaymentStatus;

  @ApiProperty({ description: 'Estado de reservación', enum: ReservationStatus })
  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Código de cupón', required: false })
  @IsOptional()
  @IsString()
  coupon_code?: string;

  @ApiProperty({ description: 'ID de la empresa' })
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ description: 'Lista de pasajeros', type: [PassengerDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers?: PassengerDto[];
}

