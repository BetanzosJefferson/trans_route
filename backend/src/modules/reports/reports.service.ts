import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class ReportsService {
  constructor(private supabaseService: SupabaseService) {}

  async getFinancialReport(companyId: string, fromDate: string, toDate: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Get transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('company_id', companyId)
      .gte('created_at', fromDate)
      .lte('created_at', toDate);

    // Get expenses
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('company_id', companyId)
      .gte('expense_date', fromDate)
      .lte('expense_date', toDate);

    const totalIncome = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    return {
      period: { from: fromDate, to: toDate },
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: totalIncome - totalExpenses,
      transactions_count: transactions?.length || 0,
      expenses_count: expenses?.length || 0,
      transactions,
      expenses,
    };
  }

  async getSalesReport(companyId: string, fromDate: string, toDate: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data: reservations } = await supabase
      .from('reservations')
      .select('*, trip_segment:trip_segments(*, trip:trips(*, route:routes(*)))')
      .eq('company_id', companyId)
      .gte('created_at', fromDate)
      .lte('created_at', toDate)
      .eq('status', 'confirmed');

    const totalSales = reservations?.reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;
    const totalSeats = reservations?.reduce((sum, r) => sum + r.seats_reserved, 0) || 0;

    return {
      period: { from: fromDate, to: toDate },
      total_sales: totalSales,
      total_reservations: reservations?.length || 0,
      total_seats_sold: totalSeats,
      average_ticket: totalSales / (reservations?.length || 1),
      reservations,
    };
  }
}

