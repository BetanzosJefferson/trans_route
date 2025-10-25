import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { SupabaseModule } from '../../shared/supabase/supabase.module';
import { StopsModule } from '../stops/stops.module';

@Module({
  imports: [SupabaseModule, StopsModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}

