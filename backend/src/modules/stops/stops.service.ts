import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateStopDto } from './dto/create-stop.dto';
import { UpdateStopDto } from './dto/update-stop.dto';
import { FindOrCreateStopDto } from './dto/find-or-create-stop.dto';

@Injectable()
export class StopsService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Parsear ubicación en formato legacy: "Ciudad, Estado|Nombre"
   */
  private parseLocation(fullLocation: string): {
    city: string;
    state: string;
    name: string;
  } {
    const parts = fullLocation.split('|');
    const locationPart = parts[0]?.trim() || '';
    const name = parts[1]?.trim() || parts[0]?.trim() || '';

    const cityState = locationPart.split(',');
    const city = cityState[0]?.trim() || '';
    const state = cityState[1]?.trim() || '';

    return { city, state, name };
  }

  /**
   * Crear una nueva parada
   */
  async create(createStopDto: CreateStopDto) {
    const supabase = this.supabaseService.getServiceClient();

    // Generar full_location si no se proporciona
    const fullLocation =
      createStopDto.full_location ||
      `${createStopDto.city}, ${createStopDto.state}|${createStopDto.name}`;

    const { data, error } = await supabase
      .from('stops')
      .insert([
        {
          ...createStopDto,
          full_location: fullLocation,
          country: createStopDto.country || 'México',
          stop_type: createStopDto.stop_type || 'terminal',
          is_active: createStopDto.is_active ?? true,
        },
      ])
      .select()
      .single();

    if (error) {
      // Si el error es de duplicado, intentar obtener el existente
      if (error.code === '23505') {
        return this.findByLocation(
          createStopDto.city,
          createStopDto.state,
          createStopDto.name,
          createStopDto.company_id,
        );
      }
      throw new Error(`Error creating stop: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtener todas las paradas de una compañía
   */
  async findAll(companyId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('city', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Error fetching stops: ${error.message}`);
    }

    return data;
  }

  /**
   * Buscar una parada por ID
   */
  async findOne(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Parada con ID ${id} no encontrada`);
    }

    return data;
  }

  /**
   * Buscar parada por ubicación exacta
   */
  async findByLocation(
    city: string,
    state: string,
    name: string,
    companyId: string,
  ) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .eq('company_id', companyId)
      .eq('city', city)
      .eq('state', state)
      .eq('name', name)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Buscar o crear parada (usado para compatibilidad con strings legacy)
   */
  async findOrCreate(findOrCreateDto: FindOrCreateStopDto) {
    const { city, state, name } = this.parseLocation(
      findOrCreateDto.full_location,
    );

    // Intentar encontrar primero
    const existing = await this.findByLocation(
      city,
      state,
      name,
      findOrCreateDto.company_id,
    );

    if (existing) {
      return existing;
    }

    // Si no existe, crear
    return this.create({
      name,
      city,
      state,
      full_location: findOrCreateDto.full_location,
      company_id: findOrCreateDto.company_id,
      country: 'México',
      stop_type: 'terminal',
      is_active: true,
    });
  }

  /**
   * Buscar paradas con autocompletado
   */
  async searchStops(query: string, companyId: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Búsqueda por nombre, ciudad o estado
    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .or(
        `name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%,full_location.ilike.%${query}%`,
      )
      .order('name', { ascending: true })
      .limit(20);

    if (error) {
      throw new Error(`Error searching stops: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar una parada
   */
  async update(id: string, updateStopDto: UpdateStopDto) {
    const supabase = this.supabaseService.getServiceClient();

    // Verificar que existe
    await this.findOne(id);

    const { data, error } = await supabase
      .from('stops')
      .update(updateStopDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating stop: ${error.message}`);
    }

    return data;
  }

  /**
   * Eliminar una parada (soft delete)
   */
  async remove(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { error } = await supabase
      .from('stops')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting stop: ${error.message}`);
    }

    return { message: 'Parada eliminada exitosamente' };
  }
}

