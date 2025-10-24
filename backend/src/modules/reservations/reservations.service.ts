import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createReservationDto: CreateReservationDto, userId: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Check seat availability
    const { data: segment } = await supabase
      .from('trip_segments')
      .select('available_seats')
      .eq('id', createReservationDto.trip_segment_id)
      .single();

    if (!segment || segment.available_seats < createReservationDto.seats_reserved) {
      throw new BadRequestException('No hay suficientes asientos disponibles');
    }

    // Create reservation
    const reservationData = {
      ...createReservationDto,
      created_by_user_id: userId,
      last_updated_by_user_id: userId,
    };

    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select()
      .single();

    if (reservationError) {
      throw new Error(`Error creating reservation: ${reservationError.message}`);
    }

    // Update available seats
    await supabase
      .from('trip_segments')
      .update({
        available_seats: segment.available_seats - createReservationDto.seats_reserved,
      })
      .eq('id', createReservationDto.trip_segment_id);

    // Create passengers if provided
    if (createReservationDto.passengers && createReservationDto.passengers.length > 0) {
      const passengersData = createReservationDto.passengers.map((p) => ({
        ...p,
        reservation_id: reservation.id,
      }));

      await supabase.from('passengers').insert(passengersData);
    }

    return reservation;
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

