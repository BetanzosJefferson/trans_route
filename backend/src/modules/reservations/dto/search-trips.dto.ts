import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsUUID,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';

export class SearchTripsDto {
  @ApiProperty({ description: 'ID de la empresa', required: false })
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @ApiProperty({ description: 'Origen (formato: "Ciudad, Estado|Nombre")', required: false })
  @IsString()
  @IsOptional()
  origin?: string;

  @ApiProperty({ description: 'Destino (formato: "Ciudad, Estado|Nombre")', required: false })
  @IsString()
  @IsOptional()
  destination?: string;

  @ApiProperty({ description: 'Fecha desde (ISO 8601)', required: false })
  @IsDateString()
  @IsOptional()
  date_from?: string;

  @ApiProperty({ description: 'Fecha hasta (ISO 8601)', required: false })
  @IsDateString()
  @IsOptional()
  date_to?: string;

  @ApiProperty({ description: 'Mínimo de asientos disponibles', required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  min_seats?: number;

  @ApiProperty({
    description: 'Solo viajes principales (origen-destino completo)',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  main_trips_only?: boolean;
}

