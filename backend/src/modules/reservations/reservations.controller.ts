import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { SearchTripsDto } from './dto/search-trips.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('reservations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva reservación con transacción atómica' })
  create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('company_id') companyId: string,
  ) {
    return this.reservationsService.create(createReservationDto, userId, companyId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar viajes disponibles para Nueva Reserva' })
  searchAvailableTrips(@Query() filters: SearchTripsDto) {
    return this.reservationsService.searchAvailableTrips(filters);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las reservaciones' })
  findAll(@Query('company_id') companyId: string, @Query() filters: any) {
    return this.reservationsService.findAll(companyId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener reservación por ID' })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar reservación' })
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.update(id, updateReservationDto, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar reservación' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reservationsService.cancel(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar reservación' })
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}

