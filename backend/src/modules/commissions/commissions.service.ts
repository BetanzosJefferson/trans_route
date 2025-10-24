import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class CommissionsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(data: any) {
    const supabase = this.supabaseService.getServiceClient();
    const { data: result, error } = await supabase.from('commissions').insert([data]).select().single();
    if (error) throw new Error(error.message);
    return result;
  }

  async findAll(companyId: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null);
    if (error) throw new Error(error.message);
    return data;
  }

  async getCommissionLogs(companyId: string, userId?: string) {
    const supabase = this.supabaseService.getServiceClient();
    let query = supabase
      .from('commission_log')
      .select('*, user:users(first_name, last_name), reservation:reservations(*)')
      .eq('company_id', companyId);

    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }
}

