import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StopsService } from './stops.service';
import { CreateStopDto } from './dto/create-stop.dto';
import { UpdateStopDto } from './dto/update-stop.dto';
import { FindOrCreateStopDto } from './dto/find-or-create-stop.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('stops')
@Controller('stops')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StopsController {
  constructor(private readonly stopsService: StopsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva parada' })
  create(@Body() createStopDto: CreateStopDto) {
    return this.stopsService.create(createStopDto);
  }

  @Post('find-or-create')
  @ApiOperation({ 
    summary: 'Buscar o crear parada desde formato legacy',
    description: 'Busca una parada por ubicación legacy. Si no existe, la crea automáticamente.'
  })
  findOrCreate(@Body() findOrCreateDto: FindOrCreateStopDto) {
    return this.stopsService.findOrCreate(findOrCreateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las paradas de una compañía' })
  @ApiQuery({ name: 'company_id', required: true })
  findAll(@Query('company_id') companyId: string) {
    return this.stopsService.findAll(companyId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar paradas con autocompletado' })
  @ApiQuery({ name: 'query', required: true, description: 'Texto de búsqueda' })
  @ApiQuery({ name: 'company_id', required: true })
  search(
    @Query('query') query: string,
    @Query('company_id') companyId: string,
  ) {
    return this.stopsService.searchStops(query, companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una parada por ID' })
  findOne(@Param('id') id: string) {
    return this.stopsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una parada' })
  update(@Param('id') id: string, @Body() updateStopDto: UpdateStopDto) {
    return this.stopsService.update(id, updateStopDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una parada (soft delete)' })
  remove(@Param('id') id: string) {
    return this.stopsService.remove(id);
  }
}

