import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class BoxCutoffsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(data: any, userId: string) {
    const supabase = this.supabaseService.getServiceClient();
    
    // Calculate totals from transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('company_id', data.company_id)
      .eq('user_id', userId)
      .is('box_cutoff_id', null)
      .gte('created_at', data.start_date)
      .lte('created_at', data.end_date);

    const totals = (transactions || []).reduce(
      (acc, t) => {
        if (t.payment_method === 'cash') acc.total_cash += t.amount;
        if (t.payment_method === 'transfer') acc.total_transfers += t.amount;
        if (t.payment_method === 'card') acc.total_card += t.amount;
        return acc;
      },
      { total_cash: 0, total_transfers: 0, total_card: 0 }
    );

    const cutoffData = { ...data, ...totals, user_id: userId };
    const { data: cutoff, error } = await supabase
      .from('box_cutoffs')
      .insert([cutoffData])
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update transactions with cutoff_id
    if (transactions && transactions.length > 0) {
      await supabase
        .from('transactions')
        .update({ box_cutoff_id: cutoff.id })
        .in('id', transactions.map((t) => t.id));
    }

    return cutoff;
  }

  async findAll(companyId: string) {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase
      .from('box_cutoffs')
      .select('*, user:users(first_name, last_name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }
}

