import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateStopDto {
  @ApiProperty({ description: 'Nombre de la parada', example: 'CONDESA' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Ciudad', example: 'Acapulco de Juarez' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Estado', example: 'Guerrero' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'País', example: 'México', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ 
    description: 'Ubicación completa (formato legacy)', 
    example: 'Acapulco de Juarez, Guerrero|CONDESA',
    required: false 
  })
  @IsString()
  @IsOptional()
  full_location?: string;

  @ApiProperty({ description: 'ID de la compañía' })
  @IsUUID()
  company_id: string;

  @ApiProperty({ 
    description: 'Tipo de parada', 
    example: 'terminal',
    required: false 
  })
  @IsString()
  @IsOptional()
  stop_type?: string;

  @ApiProperty({ description: 'Si la parada está activa', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

