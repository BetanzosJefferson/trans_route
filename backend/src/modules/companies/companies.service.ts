import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('companies')
      .insert([createCompanyDto])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating company: ${error.message}`);
    }

    return data;
  }

  async findAll() {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching companies: ${error.message}`);
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    return data;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('companies')
      .update(updateCompanyDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating company: ${error.message}`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('companies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error deleting company: ${error.message}`);
    }

    return { message: 'Empresa eliminada exitosamente' };
  }
}

