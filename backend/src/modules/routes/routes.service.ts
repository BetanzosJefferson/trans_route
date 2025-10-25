import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { StopsService } from '../stops/stops.service';

@Injectable()
export class RoutesService {
  constructor(
    private supabaseService: SupabaseService,
    private stopsService: StopsService,
  ) {}

  async create(createRouteDto: CreateRouteDto, userId: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Si tenemos strings pero no IDs, buscar/crear stops automáticamente
    let origin_stop_id = createRouteDto.origin_stop_id;
    let destination_stop_id = createRouteDto.destination_stop_id;
    let stop_ids = createRouteDto.stop_ids;
    let origin = createRouteDto.origin;
    let destination = createRouteDto.destination;
    let stops = createRouteDto.stops;

    // Procesar origen
    if (!origin_stop_id && origin) {
      const originStop = await this.stopsService.findOrCreate({
        full_location: origin,
        company_id: createRouteDto.company_id,
      });
      origin_stop_id = originStop.id;
    } else if (origin_stop_id && !origin) {
      // Si solo tenemos ID, obtener el string
      const originStop = await this.stopsService.findOne(origin_stop_id);
      origin = originStop.full_location;
    }

    // Procesar destino
    if (!destination_stop_id && destination) {
      const destStop = await this.stopsService.findOrCreate({
        full_location: destination,
        company_id: createRouteDto.company_id,
      });
      destination_stop_id = destStop.id;
    } else if (destination_stop_id && !destination) {
      const destStop = await this.stopsService.findOne(destination_stop_id);
      destination = destStop.full_location;
    }

    // Procesar paradas intermedias
    if (!stop_ids && stops && stops.length > 0) {
      stop_ids = [];
      for (const stop of stops) {
        const stopData = await this.stopsService.findOrCreate({
          full_location: stop,
          company_id: createRouteDto.company_id,
        });
        stop_ids.push(stopData.id);
      }
    } else if (stop_ids && stop_ids.length > 0 && (!stops || stops.length === 0)) {
      stops = [];
      for (const stopId of stop_ids) {
        const stopData = await this.stopsService.findOne(stopId);
        stops.push(stopData.full_location);
      }
    }

    const { data, error } = await supabase
      .from('routes')
      .insert([
        {
          ...createRouteDto,
          origin,
          destination,
          stops,
          origin_stop_id,
          destination_stop_id,
          stop_ids,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating route: ${error.message}`);
    }

    return data;
  }

  async findAll(companyId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching routes: ${error.message}`);
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }

    return data;
  }

  async update(id: string, updateRouteDto: UpdateRouteDto) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('routes')
      .update(updateRouteDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating route: ${error.message}`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('routes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error deleting route: ${error.message}`);
    }

    return { message: 'Ruta eliminada exitosamente' };
  }

  async getAllStops(companyId: string) {
    // Obtener stops directamente desde la tabla stops (más eficiente)
    const stops = await this.stopsService.findAll(companyId);

    return stops.map((stop) => ({
      id: stop.id,
      value: stop.full_location,
      label: stop.name,
      location: `${stop.city}, ${stop.state}`,
      city: stop.city,
      state: stop.state,
      country: stop.country,
    }));
  }
}

