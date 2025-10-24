import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private serviceSupabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY') || '';

    // Client with anon key (respects RLS)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Admin client with service role (bypasses RLS)
    this.serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getServiceClient(): SupabaseClient {
    return this.serviceSupabase;
  }

  // Helper method to set auth context for RLS
  setAuthContext(userId: string) {
    // This would be used to set the auth context for RLS
    // Implementation depends on your RLS policies
    return this.supabase.auth.setSession;
  }
}

