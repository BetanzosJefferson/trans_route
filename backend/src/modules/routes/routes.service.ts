import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createRouteDto: CreateRouteDto, userId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('routes')
      .insert([createRouteDto])
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
}

