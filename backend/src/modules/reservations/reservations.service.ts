import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { SearchTripsDto } from './dto/search-trips.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { ModifyTripDto } from './dto/modify-trip.dto';
import { TransferReservationDto } from './dto/transfer-reservation.dto';
import { CheckInReservationDto } from './dto/check-in-reservation.dto';
import { FindAllReservationsDto } from './dto/find-all-reservations.dto';

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

  /**
   * Obtiene todas las reservas con filtros avanzados y paginación
   */
  async findAll(filters: FindAllReservationsDto) {
    const supabase = this.supabaseService.getServiceClient();

    // Usar vista que calcula amount_paid automáticamente
    let query = supabase
      .from('reservations_with_amounts')
      .select(`
        *,
        client:clients(*),
        trip_segment:trip_segments(*, trip:trips(*, route:routes(*))),
        created_by:users!created_by_user_id(first_name, last_name),
        checked_in_by:users!checked_in_by_user_id(first_name, last_name)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Filtros
    if (filters.companyId) {
      query = query.eq('company_id', filters.companyId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }

    if (filters.tripId) {
      // Filtrar por trip_id mediante trip_segments
      const { data: segments } = await supabase
        .from('trip_segments')
        .select('id')
        .eq('trip_id', filters.tripId);
      
      const segmentIds = segments?.map(s => s.id) || [];
      if (segmentIds.length > 0) {
        query = query.in('trip_segment_id', segmentIds);
      } else {
        return { data: [], total: 0, page: filters.page, limit: filters.limit };
      }
    }

    if (filters.isNoShow !== undefined) {
      query = query.eq('is_no_show', filters.isNoShow);
    }

    if (filters.checkedIn !== undefined) {
      if (filters.checkedIn) {
        query = query.not('checked_in_at', 'is', null);
      } else {
        query = query.is('checked_in_at', null);
      }
    }

    // Contar total antes de paginar
    const { count } = await supabase
      .from('reservations_with_amounts')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching reservations: ${error.message}`);
    }

    return {
      data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
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

  /**
   * Obtiene el saldo en caja del usuario (transacciones sin corte)
   */
  async getUserCashBalance(userId: string, companyId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase.rpc('get_user_cash_balance', {
      p_user_id: userId,
      p_company_id: companyId,
    });

    if (error) {
      throw new Error(`Error obteniendo saldo en caja: ${error.message}`);
    }

    return { balance: data || 0 };
  }

  /**
   * Cancela una reserva con o sin reembolso
   * Usa la función PostgreSQL que valida saldo y maneja asientos
   */
  async cancelWithRefund(
    id: string,
    cancelDto: CancelReservationDto,
    userId: string,
  ) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase.rpc('cancel_reservation_with_refund', {
      p_reservation_id: id,
      p_user_id: userId,
      p_refund_amount: cancelDto.refundAmount,
      p_cancellation_reason: cancelDto.cancellationReason,
      p_payment_method: cancelDto.paymentMethod,
    });

    if (error) {
      throw new BadRequestException(`Error cancelando reserva: ${error.message}`);
    }

    return data;
  }

  /**
   * Modifica el viaje de una reserva (cambio de fecha/hora)
   * Usa la función PostgreSQL que maneja asientos automáticamente
   */
  async modifyTrip(id: string, modifyDto: ModifyTripDto, userId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase.rpc('modify_reservation_trip', {
      p_reservation_id: id,
      p_new_trip_segment_id: modifyDto.newTripSegmentId,
      p_user_id: userId,
    });

    if (error) {
      throw new BadRequestException(`Error modificando viaje: ${error.message}`);
    }

    return data;
  }

  /**
   * Agrega un pago a una reserva existente
   * Soporta pagos mixtos (múltiples transacciones)
   */
  async addPayment(
    id: string,
    paymentDto: AddPaymentDto,
    userId: string,
    companyId: string,
  ) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase.rpc('add_payment_to_reservation', {
      p_reservation_id: id,
      p_amount: paymentDto.amount,
      p_payment_method: paymentDto.paymentMethod,
      p_user_id: userId,
      p_company_id: companyId,
    });

    if (error) {
      throw new BadRequestException(`Error agregando pago: ${error.message}`);
    }

    return data;
  }

  /**
   * Marca una reserva como check-in realizado
   */
  async checkIn(id: string, userId: string, dto?: CheckInReservationDto) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('reservations')
      .update({
        checked_in_at: new Date().toISOString(),
        checked_in_by_user_id: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error en check-in: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException('Reserva no encontrada');
    }

    // Audit log
    if (dto?.notes) {
      await supabase.from('audit_logs').insert({
        table_name: 'reservations',
        record_id: id,
        action: 'check_in',
        changed_by_user_id: userId,
        company_id: data.company_id,
        changes: { notes: dto.notes },
      });
    }

    return { success: true, data };
  }

  /**
   * Transfiere una reserva a otra compañía
   */
  async transfer(id: string, transferDto: TransferReservationDto, userId: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Obtener reserva actual
    const reservation = await this.findOne(id);

    const { data, error } = await supabase
      .from('reservations')
      .update({
        transferred_to_company_id: transferDto.transferredToCompanyId,
        transfer_notes: transferDto.transferNotes || null,
        status: 'cancelled', // La reserva original se cancela
        last_updated_by_user_id: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error transfiriendo reserva: ${error.message}`);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      table_name: 'reservations',
      record_id: id,
      action: 'transfer',
      changed_by_user_id: userId,
      company_id: reservation.company_id,
      changes: {
        transferred_to: transferDto.transferredToCompanyId,
        notes: transferDto.transferNotes,
      },
    });

    return { success: true, data };
  }

  /**
   * Marca una reserva como no-show
   * Llamado por el cron job después de 5 horas de la salida sin check-in
   */
  async markNoShow(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('reservations')
      .update({
        is_no_show: true,
        no_show_marked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error marcando no-show: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtiene todas las reservas de un viaje específico
   * Útil para la vista "Agrupada por Viaje"
   */
  async findByTrip(tripId: string, companyId: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Obtener todos los trip_segments del viaje
    const { data: segments } = await supabase
      .from('trip_segments')
      .select('id')
      .eq('trip_id', tripId);

    const segmentIds = segments?.map(s => s.id) || [];

    if (segmentIds.length === 0) {
      return [];
    }

    // Obtener reservas usando la vista
    const { data, error } = await supabase
      .from('reservations_with_amounts')
      .select(`
        *,
        client:clients(*),
        trip_segment:trip_segments(*),
        checked_in_by:users!checked_in_by_user_id(first_name, last_name)
      `)
      .in('trip_segment_id', segmentIds)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('trip_segment_id', { ascending: true });

    if (error) {
      throw new Error(`Error obteniendo reservas del viaje: ${error.message}`);
    }

    return data;
  }

  /**
   * Soft delete de una reserva
   */
  async remove(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('reservations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error eliminando reserva: ${error.message}`);
    }

    return { message: 'Reservación eliminada exitosamente' };
  }
}

