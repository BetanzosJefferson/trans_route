import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { ReservationsService } from './reservations.service';

@Injectable()
export class ReservationsCronService {
  private readonly logger = new Logger(ReservationsCronService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly reservationsService: ReservationsService,
  ) {}

  /**
   * Cron job que se ejecuta cada hora
   * Marca como no-show las reservas que:
   * - No tienen check-in realizado
   * - La salida fue hace más de 5 horas
   * - No están canceladas
   */
  @Cron(CronExpression.EVERY_HOUR)
  async markNoShowReservations() {
    this.logger.log('🔄 Ejecutando cron job para marcar no-shows...');

    const supabase = this.supabaseService.getServiceClient();

    // Calcular timestamp de hace 5 horas
    const fiveHoursAgo = new Date();
    fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5);

    try {
      // Buscar reservas candidatas a no-show
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select(`
          id,
          trip_segment:trip_segments(departure_time)
        `)
        .is('checked_in_at', null) // Sin check-in
        .eq('is_no_show', false) // No marcada como no-show
        .neq('status', 'cancelled') // No cancelada
        .is('deleted_at', null); // No eliminada

      if (error) {
        this.logger.error(`❌ Error obteniendo reservas: ${error.message}`);
        return;
      }

      if (!reservations || reservations.length === 0) {
        this.logger.log('✅ No hay reservas candidatas a no-show');
        return;
      }

      // Filtrar las que tienen salida hace más de 5 horas
      const noShowCandidates = reservations.filter((r: any) => {
        const departureTime = new Date(r.trip_segment.departure_time);
        return departureTime <= fiveHoursAgo;
      });

      if (noShowCandidates.length === 0) {
        this.logger.log('✅ No hay reservas con más de 5 horas de retraso');
        return;
      }

      this.logger.log(`📋 Encontradas ${noShowCandidates.length} reservas para marcar como no-show`);

      // Marcar cada una como no-show
      let markedCount = 0;
      let errorCount = 0;

      for (const reservation of noShowCandidates) {
        try {
          await this.reservationsService.markNoShow(reservation.id);
          markedCount++;
          this.logger.debug(`  ✓ Reserva ${reservation.id} marcada como no-show`);
        } catch (error) {
          errorCount++;
          this.logger.error(`  ✗ Error marcando reserva ${reservation.id}: ${error.message}`);
        }
      }

      this.logger.log(
        `✅ Cron job completado. Marcadas: ${markedCount}, Errores: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error(`❌ Error general en cron job: ${error.message}`);
    }
  }

  /**
   * Método manual para ejecutar el cron job
   * Útil para testing
   */
  async runManually() {
    this.logger.log('🔧 Ejecutando cron job manualmente...');
    await this.markNoShowReservations();
  }
}

