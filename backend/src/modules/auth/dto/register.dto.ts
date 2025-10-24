import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  @IsString()
  @IsNotEmpty({ message: 'Nombre es requerido' })
  first_name: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'Apellido es requerido' })
  last_name: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@transroute.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Contraseña es requerida' })
  @MinLength(6, { message: 'Contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.CASHIER,
  })
  @IsEnum(UserRole, { message: 'Rol inválido' })
  role: UserRole;

  @ApiProperty({
    description: 'Teléfono del usuario',
    example: '+52 123 456 7890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'ID de la empresa',
    example: '11111111-1111-1111-1111-111111111111',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID de empresa inválido' })
  company_id?: string;
}

