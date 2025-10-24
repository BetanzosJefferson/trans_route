import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createVehicleDto: CreateVehicleDto) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('vehicles')
      .insert([createVehicleDto])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating vehicle: ${error.message}`);
    }

    return data;
  }

  async findAll(companyId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('economic_number', { ascending: true });

    if (error) {
      throw new Error(`Error fetching vehicles: ${error.message}`);
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }

    return data;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('vehicles')
      .update(updateVehicleDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating vehicle: ${error.message}`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('vehicles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error deleting vehicle: ${error.message}`);
    }

    return { message: 'Vehículo eliminado exitosamente' };
  }
}

