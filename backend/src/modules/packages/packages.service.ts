import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class PackagesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(data: any) {
    const supabase = this.supabaseService.getServiceClient();
    const { data: result, error } = await supabase.from('packages').insert([data]).select().single();
    if (error) throw new Error(error.message);
    return result;
  }

  async findAll(companyId: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase
      .from('packages')
      .select('*, trip:trips(*)')
      .eq('company_id', companyId)
      .is('deleted_at', null);
    if (error) throw new Error(error.message);
    return data;
  }
}

