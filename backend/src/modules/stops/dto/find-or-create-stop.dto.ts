import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class FindOrCreateStopDto {
  @ApiProperty({ 
    description: 'Ubicación en formato legacy', 
    example: 'Acapulco de Juarez, Guerrero|CONDESA' 
  })
  @IsString()
  full_location: string;

  @ApiProperty({ description: 'ID de la compañía' })
  @IsUUID()
  company_id: string;
}

