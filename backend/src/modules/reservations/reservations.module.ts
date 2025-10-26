import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationsCronService } from './reservations.cron';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsCronService],
  exports: [ReservationsService],
})
export class ReservationsModule {}

