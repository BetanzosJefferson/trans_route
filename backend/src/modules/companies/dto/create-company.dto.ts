import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Nombre de la empresa' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Razón social', required: false })
  @IsOptional()
  @IsString()
  legal_name?: string;

  @ApiProperty({ description: 'RFC o identificador fiscal', required: false })
  @IsOptional()
  @IsString()
  tax_id?: string;

  @ApiProperty({ description: 'Email de contacto', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Teléfono', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Dirección', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'URL del logo', required: false })
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiProperty({ description: 'Empresa activa', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

