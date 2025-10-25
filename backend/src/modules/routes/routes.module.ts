import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { SupabaseModule } from '../../shared/supabase/supabase.module';
import { StopsModule } from '../stops/stops.module';

@Module({
  imports: [SupabaseModule, StopsModule],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}

