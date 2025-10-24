import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsObject,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class TimeSegment {
  hours: number;
  minutes: number;
}

export class PriceSegment {
  price: number;
  enabled: boolean;
}

export class CreateRouteTemplateDto {
  @ApiProperty({ description: 'ID de la ruta base' })
  @IsUUID()
  @IsNotEmpty()
  route_id: string;

  @ApiProperty({ description: 'ID de la empresa' })
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ description: 'Nombre de la plantilla', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'Configuración de tiempos entre paradas',
    example: { '0-1': { hours: 0, minutes: 30 }, '1-2': { hours: 1, minutes: 15 } }
  })
  @IsObject()
  @IsNotEmpty()
  time_configuration: Record<string, TimeSegment>;

  @ApiProperty({ 
    description: 'Configuración de precios para cada combinación',
    example: { '0-1': { price: 150, enabled: true }, '0-2': { price: 300, enabled: false } }
  })
  @IsObject()
  @IsNotEmpty()
  price_configuration: Record<string, PriceSegment>;

  @ApiProperty({ description: 'Plantilla activa', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

