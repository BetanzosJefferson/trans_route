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
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { ModifyTripDto } from './dto/modify-trip.dto';
import { TransferReservationDto } from './dto/transfer-reservation.dto';
import { CheckInReservationDto } from './dto/check-in-reservation.dto';
import { FindAllReservationsDto } from './dto/find-all-reservations.dto';
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

  @Get('origins')
  @ApiOperation({ summary: 'Obtener orígenes disponibles por fecha' })
  getAvailableOrigins(
    @Query('company_id') companyId: string,
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
  ) {
    return this.reservationsService.getAvailableOrigins(companyId, dateFrom, dateTo);
  }

  @Get('destinations')
  @ApiOperation({ summary: 'Obtener destinos disponibles por origen y fecha' })
  getAvailableDestinations(
    @Query('company_id') companyId: string,
    @Query('origin_stop_id') originStopId: string,
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
  ) {
    return this.reservationsService.getAvailableDestinations(companyId, originStopId, dateFrom, dateTo);
  }

  @Get('cash-balance')
  @ApiOperation({ summary: 'Obtener saldo en caja del usuario actual' })
  getCashBalance(
    @CurrentUser('id') userId: string,
    @CurrentUser('company_id') companyId: string,
  ) {
    return this.reservationsService.getUserCashBalance(userId, companyId);
  }

  @Get('by-trip/:tripId')
  @ApiOperation({ summary: 'Obtener todas las reservas de un viaje' })
  findByTrip(
    @Param('tripId') tripId: string,
    @CurrentUser('company_id') companyId: string,
  ) {
    return this.reservationsService.findByTrip(tripId, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las reservaciones con filtros y paginación' })
  findAll(@Query() filters: FindAllReservationsDto) {
    return this.reservationsService.findAll(filters);
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
  @ApiOperation({ summary: 'Cancelar reservación con o sin reembolso' })
  cancelWithRefund(
    @Param('id') id: string,
    @Body() cancelDto: CancelReservationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.cancelWithRefund(id, cancelDto, userId);
  }

  @Post(':id/add-payment')
  @ApiOperation({ summary: 'Agregar pago a una reservación (soporta pagos mixtos)' })
  addPayment(
    @Param('id') id: string,
    @Body() paymentDto: AddPaymentDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('company_id') companyId: string,
  ) {
    return this.reservationsService.addPayment(id, paymentDto, userId, companyId);
  }

  @Post(':id/modify-trip')
  @ApiOperation({ summary: 'Modificar viaje de una reservación (cambio de fecha/hora)' })
  modifyTrip(
    @Param('id') id: string,
    @Body() modifyDto: ModifyTripDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.modifyTrip(id, modifyDto, userId);
  }

  @Post(':id/check-in')
  @ApiOperation({ summary: 'Realizar check-in de una reservación' })
  checkIn(
    @Param('id') id: string,
    @Body() dto: CheckInReservationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.checkIn(id, userId, dto);
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transferir reservación a otra compañía' })
  transfer(
    @Param('id') id: string,
    @Body() transferDto: TransferReservationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.transfer(id, transferDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar reservación (soft delete)' })
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}

