import { Module } from '@nestjs/common';
import { StopsService } from './stops.service';
import { StopsController } from './stops.controller';
import { SupabaseModule } from '../../shared/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [StopsController],
  providers: [StopsService],
  exports: [StopsService],
})
export class StopsModule {}

