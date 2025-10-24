import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class NotificationsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(data: any) {
    const supabase = this.supabaseService.getServiceClient();
    const { data: result, error } = await supabase.from('notifications').insert([data]).select().single();
    if (error) throw new Error(error.message);
    return result;
  }

  async findAllByUser(userId: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async markAsRead(id: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}

