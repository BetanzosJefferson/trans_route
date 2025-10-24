import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TripVisibility } from '../../../shared/enums/trip-visibility.enum';

export class PublishMultipleTripsDto {
  @ApiProperty({ description: 'ID de la ruta' })
  @IsUUID()
  @IsNotEmpty()
  route_id: string;

  @ApiProperty({ description: 'ID de la plantilla de ruta', required: false })
  @IsOptional()
  @IsUUID()
  route_template_id?: string;

  @ApiProperty({ description: 'ID de la empresa' })
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

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

  @ApiProperty({
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2025-10-24',
  })
  @IsString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    description: 'Fecha de fin (YYYY-MM-DD)',
    example: '2025-10-28',
  })
  @IsString()
  @IsNotEmpty()
  end_date: string;

  @ApiProperty({ description: 'Hora de salida (HH:mm)', example: '08:00' })
  @IsString()
  @IsNotEmpty()
  departure_time: string;

  @ApiProperty({ description: 'Visibilidad del viaje', enum: TripVisibility })
  @IsEnum(TripVisibility)
  @IsNotEmpty()
  visibility: TripVisibility;
}

