import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class ExpensesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(data: any, userId: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { data: result, error } = await supabase
      .from('expenses')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  }

  async findAll(companyId: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase
      .from('expenses')
      .select('*, user:users(first_name, last_name), trip:trips(*)')
      .eq('company_id', companyId)
      .is('deleted_at', null);
    if (error) throw new Error(error.message);
    return data;
  }
}

