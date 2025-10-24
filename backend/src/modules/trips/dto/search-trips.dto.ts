import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SearchTripsDto {
  @ApiProperty({ description: 'ID de la empresa' })
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ description: 'Origen', required: false })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiProperty({ description: 'Destino', required: false })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiProperty({
    description: 'Fecha desde (ISO 8601)',
    example: '2025-10-24T00:00:00Z',
  })
  @IsString()
  @IsNotEmpty()
  date_from: string;

  @ApiProperty({
    description: 'Fecha hasta (ISO 8601)',
    example: '2025-10-31T23:59:59Z',
  })
  @IsString()
  @IsNotEmpty()
  date_to: string;

  @ApiProperty({
    description: 'Asientos mínimos disponibles',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  min_seats?: number;

  @ApiProperty({
    description: 'Solo viajes principales (main trip)',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  main_trips_only?: boolean;
}

