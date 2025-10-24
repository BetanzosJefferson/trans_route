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
      await this.generateTripSegments(
        trip.id,
        createTripDto.route_id,
        createTripDto.route_template_id || null,
        trip.capacity,
        new Date(trip.departure_datetime),
      );
    }

    return trip;
  }

  async generateTripSegments(
    tripId: string,
    routeId: string,
    routeTemplateId: string | null,
    capacity: number,
    departureTime: Date,
  ) {
    const supabase = this.supabaseService.getServiceClient();

    // Obtener ruta
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (routeError || !route) {
      throw new NotFoundException('Route not found');
    }

    // Obtener plantilla si existe
    let template: any = null;
    if (routeTemplateId) {
      const { data } = await supabase
        .from('route_templates')
        .select('*')
        .eq('id', routeTemplateId)
        .single();
      template = data;
    }

    const stops = [route.origin, ...(route.stops || []), route.destination];
    const segments: any[] = [];

    let currentTime = new Date(departureTime);

    // Generar combinaciones con cálculo de tiempos
    for (let i = 0; i < stops.length; i++) {
      const segmentDepartureTime = new Date(currentTime);

      for (let j = i + 1; j < stops.length; j++) {
        const isMainTrip = i === 0 && j === stops.length - 1;
        const combinationKey = `${i}-${j}`;

        // Calcular tiempo de llegada usando plantilla
        let arrivalTime = new Date(segmentDepartureTime);
        if (template && template.time_configuration) {
          const totalMinutes = this.calculateTotalMinutes(
            template.time_configuration,
            i,
            j,
          );
          arrivalTime = new Date(
            segmentDepartureTime.getTime() + totalMinutes * 60000,
          );
        }

        // Obtener precio de plantilla o usar default
        let price = 100 * (j - i); // Default
        let enabled = true;

        if (template && template.price_configuration[combinationKey]) {
          const priceConfig = template.price_configuration[combinationKey];
          price = priceConfig.price;
          enabled = priceConfig.enabled;
        }

        // Solo crear segmentos habilitados
        if (enabled) {
          segments.push({
            trip_id: tripId,
            company_id: route.company_id,
            origin: stops[i],
            destination: stops[j],
            price,
            available_seats: capacity,
            is_main_trip: isMainTrip,
            departure_time: segmentDepartureTime.toISOString(),
            arrival_time: arrivalTime.toISOString(),
          });
        }
      }

      // Actualizar tiempo para siguiente parada
      if (i < stops.length - 1 && template && template.time_configuration) {
        const nextKey = `${i}-${i + 1}`;
        if (template.time_configuration[nextKey]) {
          const config = template.time_configuration[nextKey];
          const minutes = config.hours * 60 + config.minutes;
          currentTime = new Date(currentTime.getTime() + minutes * 60000);
        }
      }
    }

    // Insertar segmentos
    const { error: segmentsError } = await supabase
      .from('trip_segments')
      .insert(segments);

    if (segmentsError) {
      throw new Error(`Error creating segments: ${segmentsError.message}`);
    }
  }

  private calculateTotalMinutes(
    timeConfig: any,
    start: number,
    end: number,
  ): number {
    let total = 0;
    for (let i = start; i < end; i++) {
      const key = `${i}-${i + 1}`;
      if (timeConfig[key]) {
        total += timeConfig[key].hours * 60 + timeConfig[key].minutes;
      }
    }
    return total;
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

  async publishMultipleTrips(publishData: {
    route_id: string;
    route_template_id?: string;
    company_id: string;
    capacity: number;
    vehicle_id?: string;
    driver_id?: string;
    start_date: string;
    end_date: string;
    departure_time: string;
    visibility: string;
  }) {
    const trips: any[] = [];
    const startDate = new Date(publishData.start_date);
    const endDate = new Date(publishData.end_date);
    const [hours, minutes] = publishData.departure_time.split(':');

    // Iterar por cada día en el rango
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const departureDateTime = new Date(currentDate);
      departureDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Crear viaje
      const tripData: CreateTripDto = {
        route_id: publishData.route_id,
        route_template_id: publishData.route_template_id || undefined,
        company_id: publishData.company_id,
        capacity: publishData.capacity,
        vehicle_id: publishData.vehicle_id,
        driver_id: publishData.driver_id,
        departure_datetime: departureDateTime.toISOString(),
        visibility: publishData.visibility as any,
      };

      const trip = await this.create(tripData);
      trips.push(trip);

      // Incrementar día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trips;
  }

  async searchAvailableTrips(filters: {
    company_id: string;
    origin?: string;
    destination?: string;
    date_from: string;
    date_to: string;
    min_seats?: number;
    main_trips_only?: boolean;
  }) {
    const supabase = this.supabaseService.getServiceClient();

    let query = supabase
      .from('trip_segments')
      .select(
        `
        *,
        trip:trips(
          id,
          route_id,
          vehicle_id,
          driver_id,
          departure_datetime,
          visibility
        )
      `,
      )
      .eq('company_id', filters.company_id)
      .gte('departure_time', filters.date_from)
      .lte('departure_time', filters.date_to)
      .gt('available_seats', filters.min_seats || 0);

    // Por defecto solo main trips
    if (filters.main_trips_only !== false) {
      query = query.eq('is_main_trip', true);
    }

    // Búsqueda específica por origen/destino
    if (filters.origin) {
      query = query.eq('origin', filters.origin);
    }
    if (filters.destination) {
      query = query.eq('destination', filters.destination);
    }

    query = query.order('departure_time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Search error: ${error.message}`);
    }

    return data;
  }
}

