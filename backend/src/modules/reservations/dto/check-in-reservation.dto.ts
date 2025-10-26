import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckInReservationDto {
  @ApiPropertyOptional({
    description: 'Notas adicionales sobre el check-in',
    example: 'Cliente llegó con 30 minutos de anticipación',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

