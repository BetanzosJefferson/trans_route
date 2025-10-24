import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class AuditLogsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(logData: {
    user_id: string;
    action_type: string;
    table_name: string;
    record_id: string;
    old_data?: any;
    new_data?: any;
    ip_address?: string;
    user_agent?: string;
  }) {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase.from('audit_logs').insert([logData]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async findAll(filters?: { table_name?: string; user_id?: string; from_date?: string }) {
    const supabase = this.supabaseService.getServiceClient();
    let query = supabase
      .from('audit_logs')
      .select('*, user:users(first_name, last_name, email)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filters?.table_name) query = query.eq('table_name', filters.table_name);
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.from_date) query = query.gte('created_at', filters.from_date);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }
}

