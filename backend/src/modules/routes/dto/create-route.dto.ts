import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class CreateRouteDto {
  @ApiProperty({ description: 'Nombre de la ruta' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Origen (formato: "Municipio, Estado|Nombre de la parada")',
    example: 'Acapulco de Juarez, Guerrero|Terminal de autobuses A.U.'
  })
  @IsString()
  @IsNotEmpty()
  origin: string;

  @ApiProperty({ 
    description: 'Destino (formato: "Municipio, Estado|Nombre de la parada")',
    example: 'Ciudad de México, Ciudad de Mexico|Terminal TAPO'
  })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({ 
    description: 'Paradas intermedias (formato: "Municipio, Estado|Nombre de la parada")', 
    type: [String], 
    required: false,
    example: ['Chilpancingo, Guerrero|Central camionera']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stops?: string[];

  @ApiProperty({ description: 'Distancia en kilómetros', required: false })
  @IsOptional()
  @IsNumber()
  distance_km?: number;

  @ApiProperty({ description: 'Duración estimada en minutos', required: false })
  @IsOptional()
  @IsNumber()
  estimated_duration_minutes?: number;

  @ApiProperty({ description: 'ID de la empresa' })
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ description: 'Ruta activa', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

