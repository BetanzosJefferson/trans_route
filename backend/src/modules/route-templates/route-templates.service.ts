import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import { CreateRouteTemplateDto } from './dto/create-route-template.dto';
import { UpdateRouteTemplateDto } from './dto/update-route-template.dto';

// Helper function to parse location and get city
function getCityFromLocation(location: string): string {
  // Format: "Ciudad, Estado|Nombre Parada" or "Ciudad, Estado"
  const parts = location.split('|')[0]; // Remove stop name if exists
  const cityState = parts.split(',');
  return cityState[0]?.trim() || '';
}

@Injectable()
export class RouteTemplatesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreateRouteTemplateDto) {
    const supabase = this.supabaseService.getServiceClient();

    // Validate route exists
    const { data: route } = await supabase
      .from('routes')
      .select('*')
      .eq('id', createDto.route_id)
      .single();

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    // Validate no intra-city combinations have prices
    this.validateNoCityPrices(route, createDto.price_configuration);

    // Create template
    const { data, error } = await supabase
      .from('route_templates')
      .insert({
        route_id: createDto.route_id,
        company_id: createDto.company_id,
        name: createDto.name || `Plantilla ${route.name}`,
        time_configuration: createDto.time_configuration,
        price_configuration: createDto.price_configuration,
        is_active: createDto.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating route template: ${error.message}`);
    }

    return data;
  }

  async findAll(companyId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('route_templates')
      .select('*, routes(*)')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching route templates: ${error.message}`);
    }

    return data;
  }

  async findByRoute(routeId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('route_templates')
      .select('*, routes(*)')
      .eq('route_id', routeId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching route templates: ${error.message}`);
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('route_templates')
      .select('*, routes(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new NotFoundException('Route template not found');
    }

    return data;
  }

  async update(id: string, updateDto: UpdateRouteTemplateDto) {
    const supabase = this.supabaseService.getServiceClient();

    // Check if template exists
    const existing = await this.findOne(id);

    // If updating price_configuration, validate no intra-city combinations
    if (updateDto.price_configuration) {
      const { data: route } = await supabase
        .from('routes')
        .select('*')
        .eq('id', existing.route_id)
        .single();

      if (route) {
        this.validateNoCityPrices(route, updateDto.price_configuration);
      }
    }

    const { data, error } = await supabase
      .from('route_templates')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating route template: ${error.message}`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getServiceClient();

    // Soft delete
    const { error } = await supabase
      .from('route_templates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting route template: ${error.message}`);
    }

    return { message: 'Route template deleted successfully' };
  }

  // Helper: Generate all possible combinations from a route
  async generateCombinations(routeId: string) {
    const supabase = this.supabaseService.getServiceClient();

    const { data: route } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    const stops = [route.origin, ...(route.stops || []), route.destination];
    const combinations = [];

    for (let i = 0; i < stops.length; i++) {
      for (let j = i + 1; j < stops.length; j++) {
        const originCity = getCityFromLocation(stops[i]);
        const destCity = getCityFromLocation(stops[j]);
        const isIntraCity = originCity === destCity;

        combinations.push({
          key: `${i}-${j}`,
          origin: stops[i],
          destination: stops[j],
          originCity,
          destCity,
          isIntraCity,
          isConsecutive: j === i + 1,
        });
      }
    }

    return combinations;
  }

  // Helper: Validate that intra-city combinations don't have prices enabled
  private validateNoCityPrices(route: any, priceConfig: any) {
    const stops = [route.origin, ...(route.stops || []), route.destination];

    for (const key in priceConfig) {
      const [i, j] = key.split('-').map(Number);
      const originCity = getCityFromLocation(stops[i]);
      const destCity = getCityFromLocation(stops[j]);

      if (originCity === destCity && priceConfig[key].enabled) {
        throw new BadRequestException(
          `No se pueden habilitar precios para combinaciones dentro de la misma ciudad: ${originCity}`
        );
      }
    }
  }
}

