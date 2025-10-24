import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('users')
      .insert([createUserDto])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }

    return data;
  }

  async findAll(companyId?: string) {
    const supabase = this.supabaseService.getServiceClient();

    let query = supabase
      .from('users')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return data;
  }

  async findByEmail(email: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('users')
      .update(updateUserDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Soft delete
    const { data, error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }

    return { message: 'Usuario eliminado exitosamente' };
  }
}

