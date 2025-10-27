import { IsOptional, IsUUID, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class FindAllReservationsDto {
  @ApiPropertyOptional({
    description: 'ID de la compañía',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (value === '' ? undefined : value))
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Estado de la reserva',
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
  })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'cancelled', 'completed'])
  @Transform(({ value }) => (value === '' ? undefined : value))
  status?: string;

  @ApiPropertyOptional({
    description: 'Estado del pago',
    enum: ['pending', 'paid', 'refunded'],
  })
  @IsOptional()
  @IsEnum(['pending', 'paid', 'refunded'])
  @Transform(({ value }) => (value === '' ? undefined : value))
  paymentStatus?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para filtrar por fecha de viaje',
    example: '2025-10-25T06:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Fecha fin para filtrar por fecha de viaje',
    example: '2025-10-26T05:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'ID del viaje para filtrar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (value === '' ? undefined : value))
  tripId?: string;

  @ApiPropertyOptional({
    description: 'Buscar por nombre o email del cliente',
    example: 'Juan',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  clientSearch?: string;

  @ApiPropertyOptional({
    description: 'Solo no-shows',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => (value === '' ? undefined : value))
  isNoShow?: boolean;

  @ApiPropertyOptional({
    description: 'Solo check-ins realizados',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ value }) => (value === '' ? undefined : value))
  checkedIn?: boolean;

  @ApiPropertyOptional({
    description: 'Página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

