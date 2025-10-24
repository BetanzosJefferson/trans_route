import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ 
    description: 'Email del usuario invitado (opcional)',
    required: false,
    example: 'nuevo@empresa.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}

