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
import { RouteTemplatesService } from './route-templates.service';
import { CreateRouteTemplateDto } from './dto/create-route-template.dto';
import { UpdateRouteTemplateDto } from './dto/update-route-template.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@ApiTags('route-templates')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('route-templates')
export class RouteTemplatesController {
  constructor(private readonly routeTemplatesService: RouteTemplatesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nueva plantilla de ruta' })
  create(@Body() createDto: CreateRouteTemplateDto) {
    return this.routeTemplatesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las plantillas de una empresa' })
  findAll(@Query('company_id') companyId: string) {
    return this.routeTemplatesService.findAll(companyId);
  }

  @Get('by-route/:routeId')
  @ApiOperation({ summary: 'Obtener plantillas por ruta' })
  findByRoute(@Param('routeId') routeId: string) {
    return this.routeTemplatesService.findByRoute(routeId);
  }

  @Get('route/:routeId/combinations')
  @ApiOperation({ summary: 'Generar todas las combinaciones posibles de una ruta' })
  generateCombinations(@Param('routeId') routeId: string) {
    return this.routeTemplatesService.generateCombinations(routeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener plantilla por ID' })
  findOne(@Param('id') id: string) {
    return this.routeTemplatesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar plantilla' })
  update(@Param('id') id: string, @Body() updateDto: UpdateRouteTemplateDto) {
    return this.routeTemplatesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar plantilla' })
  remove(@Param('id') id: string) {
    return this.routeTemplatesService.remove(id);
  }
}

