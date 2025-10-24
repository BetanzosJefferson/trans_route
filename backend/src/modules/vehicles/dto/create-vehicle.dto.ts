import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Placas del vehículo' })
  @IsString()
  @IsNotEmpty()
  plates: string;

  @ApiProperty({ description: 'Marca del vehículo', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Modelo del vehículo', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Año del vehículo', required: false })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({ description: 'Número económico', required: false })
  @IsOptional()
  @IsString()
  economic_number?: string;

  @ApiProperty({ description: 'Capacidad de pasajeros' })
  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @ApiProperty({ description: 'Tiene aire acondicionado', default: false })
  @IsOptional()
  @IsBoolean()
  has_ac?: boolean;

  @ApiProperty({ description: 'Tiene asientos reclinables', default: false })
  @IsOptional()
  @IsBoolean()
  has_reclining_seats?: boolean;

  @ApiProperty({
    description: 'Servicios adicionales',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiProperty({ description: 'ID de la empresa' })
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ description: 'Vehículo activo', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

