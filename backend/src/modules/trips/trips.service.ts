import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CreateTripSegmentDto } from './dto/create-trip-segment.dto';

@Injectable()
export class TripsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createTripDto: CreateTripDto) {
    const supabase = this.supabaseService.getServiceClient();

    // Create trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert([createTripDto])
      .select()
      .single();

    if (tripError) {
      throw new Error(`Error creating trip: ${tripError.message}`);
    }

    // Auto-generate trip segments based on route
    if (createTripDto.route_id) {
      await this.generateTripSegments(trip.id, createTripDto.route_id, trip.capacity);
    }

    return trip;
  }

  async generateTripSegments(tripId: string, routeId: string, capacity: number) {
    const supabase = this.supabaseService.getServiceClient();

    // Fetch route information
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*, route_templates(*)')
      .eq('id', routeId)
      .single();

    if (routeError || !route) {
      throw new Error('Route not found');
    }

    // Fetch trip to get departure time
    const { data: trip } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    const segments: CreateTripSegmentDto[] = [];
    const stops = [route.origin, ...(route.stops || []), route.destination];

    // Generate segments for each origin-destination combination
    for (let i = 0; i < stops.length - 1; i++) {
      for (let j = i + 1; j < stops.length; j++) {
        const isMainTrip = i === 0 && j === stops.length - 1;
        
        // Calculate price (simplified - should use route_template pricing)
        const basePrice = 100;
        const distance = j - i;
        const price = basePrice * distance;

        segments.push({
          trip_id: tripId,
          origin: stops[i],
          destination: stops[j],
          price: price,
          available_seats: capacity,
          is_main_trip: isMainTrip,
          departure_time: trip.departure_datetime,
          arrival_time: trip.arrival_datetime,
        });
      }
    }

    // Insert all segments
    const { error: segmentsError } = await supabase
      .from('trip_segments')
      .insert(segments);

    if (segmentsError) {
      throw new Error(`Error creating trip segments: ${segmentsError.message}`);
    }
  }

  async findAll(companyId: string, filters?: any) {
    const supabase = this.supabaseService.getServiceClient();

    let query = supabase
      .from('trips')
      .select(`
        *,
        route:routes(*),
        vehicle:vehicles(*),
        driver:users(*)
      `)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('departure_datetime', { ascending: false });

    if (filters?.visibility) {
      query = query.eq('visibility', filters.visibility);
    }

    if (filters?.from_date) {
      query = query.gte('departure_datetime', filters.from_date);
    }

    if (filters?.to_date) {
      query = query.lte('departure_datetime', filters.to_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching trips: ${error.message}`);
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        route:routes(*),
        vehicle:vehicles(*),
        driver:users(*),
        trip_segments(*)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    }

    return data;
  }

  async update(id: string, updateTripDto: UpdateTripDto) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('trips')
      .update(updateTripDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating trip: ${error.message}`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('trips')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error deleting trip: ${error.message}`);
    }

    return { message: 'Viaje eliminado exitosamente' };
  }

  async getTripSegments(tripId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('trip_segments')
      .select('*')
      .eq('trip_id', tripId)
      .order('origin', { ascending: true });

    if (error) {
      throw new Error(`Error fetching trip segments: ${error.message}`);
    }

    return data;
  }
}

