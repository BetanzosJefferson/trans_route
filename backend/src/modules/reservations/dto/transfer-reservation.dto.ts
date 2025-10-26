import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferReservationDto {
  @ApiProperty({
    description: 'ID de la compañía destino (puede ser registrada o local)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  transferredToCompanyId: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la transferencia',
    example: 'Cliente prefirió cambiar de línea por horario',
  })
  @IsOptional()
  @IsString()
  transferNotes?: string;
}

