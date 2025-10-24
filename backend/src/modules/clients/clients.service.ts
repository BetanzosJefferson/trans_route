import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createClientDto: CreateClientDto) {
    const supabase = this.supabaseService.getServiceClient();

    // Check if phone already exists
    const existing = await this.findByPhone(createClientDto.phone);
    if (existing) {
      throw new ConflictException('Ya existe un cliente con este número de teléfono');
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([createClientDto])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating client: ${error.message}`);
    }

    return data;
  }

  async findAll(companyId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching clients: ${error.message}`);
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return data;
  }

  async findByPhone(phone: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phone)
      .is('deleted_at', null)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('clients')
      .update(updateClientDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating client: ${error.message}`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error deleting client: ${error.message}`);
    }

    return { message: 'Cliente eliminado exitosamente' };
  }
}

