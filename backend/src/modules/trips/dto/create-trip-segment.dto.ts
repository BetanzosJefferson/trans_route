import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateTripSegmentDto {
  @ApiProperty({ description: 'ID del viaje' })
  @IsUUID()
  @IsNotEmpty()
  trip_id: string;

  @ApiProperty({ description: 'Origen del segmento' })
  @IsString()
  @IsNotEmpty()
  origin: string;

  @ApiProperty({ description: 'Destino del segmento' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({ description: 'Precio del segmento' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Asientos disponibles' })
  @IsNumber()
  @IsNotEmpty()
  available_seats: number;

  @ApiProperty({ description: 'Es el viaje completo' })
  @IsBoolean()
  @IsNotEmpty()
  is_main_trip: boolean;

  @ApiProperty({ description: 'Hora de salida' })
  @IsDateString()
  @IsNotEmpty()
  departure_time: string;

  @ApiProperty({ description: 'Hora de llegada', required: false })
  @IsOptional()
  @IsDateString()
  arrival_time?: string;
}

