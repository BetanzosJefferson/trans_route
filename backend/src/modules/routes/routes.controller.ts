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
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('routes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nueva ruta' })
  create(@Body() createRouteDto: CreateRouteDto, @CurrentUser('id') userId: string) {
    return this.routesService.create(createRouteDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las rutas de una empresa' })
  findAll(@Query('company_id') companyId: string) {
    return this.routesService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ruta por ID' })
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar ruta' })
  update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.update(id, updateRouteDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar ruta' })
  remove(@Param('id') id: string) {
    return this.routesService.remove(id);
  }

  @Get('stops/all')
  @ApiOperation({ summary: 'Obtener todas las paradas únicas de la empresa' })
  getAllStops(@Query('company_id') companyId: string) {
    return this.routesService.getAllStops(companyId);
  }
}

