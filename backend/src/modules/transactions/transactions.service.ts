import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class TransactionsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(data: any) {
    const supabase = this.supabaseService.getServiceClient();
    const { data: result, error } = await supabase.from('transactions').insert([data]).select().single();
    if (error) throw new Error(error.message);
    return result;
  }

  async findAll(companyId: string, filters?: any) {
    const supabase = this.supabaseService.getServiceClient();
    let query = supabase
      .from('transactions')
      .select('*, user:users(first_name, last_name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (filters?.from_date) query = query.gte('created_at', filters.from_date);
    if (filters?.to_date) query = query.lte('created_at', filters.to_date);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }
}

