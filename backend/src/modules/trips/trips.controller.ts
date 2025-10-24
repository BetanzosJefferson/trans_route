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
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { PublishMultipleTripsDto } from './dto/publish-multiple-trips.dto';
import { SearchTripsDto } from './dto/search-trips.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@ApiTags('trips')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo viaje y generar segmentos automáticamente' })
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  @Post('publish-multiple')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Publicar múltiples viajes en un rango de fechas' })
  publishMultiple(@Body() dto: PublishMultipleTripsDto) {
    return this.tripsService.publishMultipleTrips(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los viajes' })
  findAll(@Query('company_id') companyId: string, @Query() filters: any) {
    return this.tripsService.findAll(companyId, filters);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar viajes disponibles (optimizado)' })
  search(@Query() filters: SearchTripsDto) {
    return this.tripsService.searchAvailableTrips(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener viaje por ID con segmentos' })
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Get(':id/segments')
  @ApiOperation({ summary: 'Obtener segmentos de un viaje' })
  getTripSegments(@Param('id') id: string) {
    return this.tripsService.getTripSegments(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar viaje' })
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripsService.update(id, updateTripDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar viaje' })
  remove(@Param('id') id: string) {
    return this.tripsService.remove(id);
  }
}

