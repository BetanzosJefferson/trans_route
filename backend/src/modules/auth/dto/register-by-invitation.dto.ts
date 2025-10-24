import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterByInvitationDto {
  @ApiProperty({ description: 'Token de invitación' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ description: 'Email del usuario' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Contraseña', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Teléfono/Contacto' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Nombre de la empresa' })
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @ApiProperty({ description: 'URL del logo de la empresa (opcional)', required: false })
  @IsOptional()
  @IsString()
  company_logo_url?: string;
}

