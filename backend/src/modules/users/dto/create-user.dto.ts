import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role.enum';

export class CreateUserDto {
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

  @ApiProperty({ description: 'Hash de contraseña' })
  @IsString()
  @IsNotEmpty()
  password_hash: string;

  @ApiProperty({ description: 'Rol del usuario', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'Teléfono', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'URL de foto de perfil', required: false })
  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  @ApiProperty({ description: 'ID de empresa', required: false })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiProperty({ description: 'Usuario activo', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

