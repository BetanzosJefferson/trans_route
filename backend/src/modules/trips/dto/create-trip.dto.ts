import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  IsString,
} from 'class-validator';
import { TripVisibility } from '../../../shared/enums/trip-visibility.enum';

export class CreateTripDto {
  @ApiProperty({ description: 'Visibilidad del viaje', enum: TripVisibility })
  @IsEnum(TripVisibility)
  @IsNotEmpty()
  visibility: TripVisibility;

  @ApiProperty({ description: 'Capacidad del viaje' })
  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @ApiProperty({ description: 'ID del vehículo', required: false })
  @IsOptional()
  @IsUUID()
  vehicle_id?: string;

  @ApiProperty({ description: 'ID del conductor', required: false })
  @IsOptional()
  @IsUUID()
  driver_id?: string;

  @ApiProperty({ description: 'ID de la ruta' })
  @IsUUID()
  @IsNotEmpty()
  route_id: string;

  @ApiProperty({ description: 'ID de la empresa' })
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ description: 'Fecha y hora de salida' })
  @IsDateString()
  @IsNotEmpty()
  departure_datetime: string;

  @ApiProperty({ description: 'Fecha y hora de llegada', required: false })
  @IsOptional()
  @IsDateString()
  arrival_datetime?: string;

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

