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

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 BACKEND - searchAvailableTrips RECIBIÓ:');
    console.log('   origin_stop_id:', filters.origin_stop_id || 'NO RECIBIDO');
    console.log('   destination_stop_id:', filters.destination_stop_id || 'NO RECIBIDO');
    console.log('   company_id:', filters.company_id);
    console.log('   date_from:', filters.date_from);
    console.log('   date_to:', filters.date_to);
    console.log('   main_trips_only:', filters.main_trips_only);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
        trip:trips!inner(
          id,
          departure_datetime,
          capacity,
          visibility,
          deleted_at,
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
      .gt('available_seats', filters.min_seats || 0)
      .is('trip.deleted_at', null)
      .eq('trip.visibility', 'published');

    // Filtros opcionales
    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id);
    }

    // Filtrado por IDs de paradas (único método soportado)
    if (filters.origin_stop_id) {
      console.log('   ✅ Aplicando filtro origin_stop_id:', filters.origin_stop_id);
      query = query.eq('origin_stop_id', filters.origin_stop_id);
    }
    if (filters.destination_stop_id) {
      console.log('   ✅ Aplicando filtro destination_stop_id:', filters.destination_stop_id);
      query = query.eq('destination_stop_id', filters.destination_stop_id);
    }

    // Solo aplicar filtro main_trips_only si NO hay filtros de origen/destino
    // Cuando se busca por origen/destino específicos, queremos TODOS los segmentos (main o no)
    const hasOriginDestFilters = filters.origin_stop_id || filters.destination_stop_id;
    if (!hasOriginDestFilters && filters.main_trips_only !== false) {
      console.log('   ✅ Sin filtros origen/destino → Filtrando solo main trips');
      query = query.eq('is_main_trip', true);
    } else if (hasOriginDestFilters) {
      console.log('   ✅ Con filtros origen/destino → Buscando TODOS los segmentos (main y no-main)');
    }

    query = query.order('departure_time', { ascending: true });

    const { data, error } = await query;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESULTADO DE SUPABASE QUERY:');
    console.log('   Error?:', error ? error.message : 'NO');
    console.log('   Datos recibidos:', data?.length || 0, 'registros');
    if (data && data.length > 0) {
      console.log('   Primer registro:');
      console.log('     - origin_stop_id:', data[0].origin_stop_id);
      console.log('     - destination_stop_id:', data[0].destination_stop_id);
      console.log('     - origin:', data[0].origin);
      console.log('     - destination:', data[0].destination);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (error) {
      throw new Error(`Error buscando viajes: ${error.message}`);
    }

    // Filtrar trips eliminados (doble verificación)
    const results = (data || []).filter(
      (segment) => segment.trip && !segment.trip.deleted_at && segment.trip.visibility === 'published',
    );

    console.log('✅ Después de filtrar deleted_at:', results.length, 'registros');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return results;
  }

  async getAvailableOrigins(companyId: string, dateFrom: string, dateTo: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Obtener trip_segments con origin_stop_id únicos
    const { data: segments, error } = await supabase
      .from('trip_segments')
      .select('origin_stop_id')
      .eq('company_id', companyId)
      .gte('departure_time', dateFrom)
      .lte('departure_time', dateTo)
      .gt('available_seats', 0)
      .not('origin_stop_id', 'is', null);

    if (error) {
      throw new Error(`Error fetching trip segments: ${error.message}`);
    }

    // Obtener IDs únicos
    const uniqueStopIds = [...new Set(segments?.map((s: any) => s.origin_stop_id).filter(Boolean))];

    if (uniqueStopIds.length === 0) {
      return [];
    }

    // Obtener información de stops
    const { data: stops, error: stopsError } = await supabase
      .from('stops')
      .select('id, name, city, state, full_location')
      .in('id', uniqueStopIds);

    if (stopsError) {
      throw new Error(`Error fetching stops: ${stopsError.message}`);
    }

    // Formatear resultado
    const origins = (stops || []).map((stop: any) => ({
      id: stop.id,
      value: stop.full_location,
      label: stop.name,
      location: `${stop.city}, ${stop.state}`,
      city: stop.city,
      state: stop.state,
    })).sort((a: any, b: any) => a.label.localeCompare(b.label));

    return origins;
  }

  async getAvailableDestinations(
    companyId: string,
    originStopId: string,
    dateFrom: string,
    dateTo: string,
  ) {
    const supabase = this.supabaseService.getServiceClient();

    // Obtener trip_segments con destination_stop_id únicos
    let query = supabase
      .from('trip_segments')
      .select('destination_stop_id')
      .eq('company_id', companyId)
      .gte('departure_time', dateFrom)
      .lte('departure_time', dateTo)
      .gt('available_seats', 0)
      .not('destination_stop_id', 'is', null);

    if (originStopId) {
      query = query.eq('origin_stop_id', originStopId);
    }

    const { data: segments, error } = await query;

    if (error) {
      throw new Error(`Error fetching trip segments: ${error.message}`);
    }

    // Obtener IDs únicos
    const uniqueStopIds = [...new Set(segments?.map((s: any) => s.destination_stop_id).filter(Boolean))];

    if (uniqueStopIds.length === 0) {
      return [];
    }

    // Obtener información de stops
    const { data: stops, error: stopsError } = await supabase
      .from('stops')
      .select('id, name, city, state, full_location')
      .in('id', uniqueStopIds);

    if (stopsError) {
      throw new Error(`Error fetching stops: ${stopsError.message}`);
    }

    // Formatear resultado
    const destinations = (stops || []).map((stop: any) => ({
      id: stop.id,
      value: stop.full_location,
      label: stop.name,
      location: `${stop.city}, ${stop.state}`,
      city: stop.city,
      state: stop.state,
    })).sort((a: any, b: any) => a.label.localeCompare(b.label));

    return destinations;
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

