import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { SearchTripsDto } from './dto/search-trips.dto';

@Injectable()
export class ReservationsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createReservationDto: CreateReservationDto, userId: string, companyId: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Usar función atómica de PostgreSQL para crear reserva + transacción juntas
    const { data, error } = await supabase.rpc('create_reservation_with_transaction', {
      p_trip_segment_id: createReservationDto.trip_segment_id,
      p_client_id: createReservationDto.client_id,
      p_seats_reserved: createReservationDto.seats_reserved,
      p_total_amount: createReservationDto.total_amount,
      p_payment_status: createReservationDto.payment_status,
      p_amount_paid: createReservationDto.amount_paid || 0,
      p_payment_method: createReservationDto.payment_method || 'cash',
      p_user_id: userId,
      p_company_id: companyId,
      p_notes: createReservationDto.notes || null,
    });

    if (error) {
      throw new BadRequestException(`Error creando reserva: ${error.message}`);
    }

    // Obtener la reserva completa con sus relaciones
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select(`
        *,
        client:clients(*),
        trip_segment:trip_segments(*, trip:trips(*, route:routes(*)))
      `)
      .eq('id', data.reservation_id)
      .single();

    if (fetchError) {
      throw new Error(`Error obteniendo reserva: ${fetchError.message}`);
    }

    return reservation;
  }

  /**
   * Busca viajes disponibles para "Nueva Reserva"
   * Si no hay filtros, retorna viajes principales de hoy/mañana
   */
  async searchAvailableTrips(filters: SearchTripsDto) {
    const supabase = this.supabaseService.getServiceClient();

    // Si no hay filtros específicos, cargar viajes principales por defecto
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateFrom = filters.date_from || today.toISOString();
    const dateTo = filters.date_to || tomorrow.toISOString();

    let query = supabase
      .from('trip_segments')
      .select(`
        *,
        trip:trips(
          id,
          departure_datetime,
          capacity,
          visibility,
          route:routes(
            id,
            name,
            origin,
            destination,
            distance_km,
            estimated_duration_minutes
          )
        )
      `)
      .gte('departure_time', dateFrom)
      .lte('departure_time', dateTo)
      .gt('available_seats', filters.min_seats || 0);

    // Filtros opcionales
    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id);
    }

    if (filters.origin) {
      query = query.eq('origin', filters.origin);
    }

    if (filters.destination) {
      query = query.eq('destination', filters.destination);
    }

    // Por defecto, solo viajes principales (origen-destino completo)
    if (filters.main_trips_only !== false) {
      query = query.eq('is_main_trip', true);
    }

    query = query.order('departure_time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error buscando viajes: ${error.message}`);
    }

    return data || [];
  }

  async findAll(companyId: string, filters?: any) {
    const supabase = this.supabaseService.getServiceClient();

    let query = supabase
      .from('reservations')
      .select(`
        *,
        client:clients(*),
        trip_segment:trip_segments(*, trip:trips(*, route:routes(*))),
        passengers(*),
        created_by:users!created_by_user_id(first_name, last_name)
      `)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching reservations: ${error.message}`);
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        client:clients(*),
        trip_segment:trip_segments(*, trip:trips(*, route:routes(*), vehicle:vehicles(*))),
        passengers(*)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Reservación con ID ${id} no encontrada`);
    }

    return data;
  }

  async update(id: string, updateReservationDto: UpdateReservationDto, userId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('reservations')
      .update({ ...updateReservationDto, last_updated_by_user_id: userId })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating reservation: ${error.message}`);
    }

    return data;
  }

  async cancel(id: string, userId: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Get reservation details
    const { data: reservation } = await supabase
      .from('reservations')
      .select('*, trip_segment:trip_segments(*)')
      .eq('id', id)
      .single();

    if (!reservation) {
      throw new NotFoundException('Reservación no encontrada');
    }

    // Update reservation status
    await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        payment_status: 'cancelled',
        last_updated_by_user_id: userId,
      })
      .eq('id', id);

    // Restore available seats
    await supabase
      .from('trip_segments')
      .update({
        available_seats:
          reservation.trip_segment.available_seats + reservation.seats_reserved,
      })
      .eq('id', reservation.trip_segment_id);

    return { message: 'Reservación cancelada exitosamente' };
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('reservations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error deleting reservation: ${error.message}`);
    }

    return { message: 'Reservación eliminada exitosamente' };
  }
}

