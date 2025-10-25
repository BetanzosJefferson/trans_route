const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testTrips() {
  console.log('🔍 Consultando trips y segments...\n');
  
  // Obtener primera empresa
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .limit(1);
  
  if (!companies || companies.length === 0) {
    console.log('❌ No hay empresas en la BD');
    return;
  }
  
  const companyId = companies[0].id;
  console.log(`✅ Empresa: ${companies[0].name}\n`);
  
  // Consultar trips
  const { data: trips } = await supabase
    .from('trips')
    .select('id, route_id, departure_datetime, capacity, visibility')
    .eq('company_id', companyId)
    .gte('departure_datetime', new Date().toISOString())
    .order('departure_datetime')
    .limit(10);
  
  console.log(`📊 Trips publicados: ${trips?.length || 0}\n`);
  
  if (trips && trips.length > 0) {
    console.log('🚌 Trips encontrados:');
    for (const trip of trips) {
      console.log(`\n  Trip ID: ${trip.id.substring(0, 8)}...`);
      console.log(`  Fecha: ${new Date(trip.departure_datetime).toLocaleDateString()}`);
      console.log(`  Hora: ${new Date(trip.departure_datetime).toLocaleTimeString()}`);
      console.log(`  Capacidad: ${trip.capacity}`);
      console.log(`  Visibilidad: ${trip.visibility}`);
      
      // Contar segments de este trip
      const { data: segments, count } = await supabase
        .from('trip_segments')
        .select('id, origin, destination, is_main_trip', { count: 'exact' })
        .eq('trip_id', trip.id);
      
      console.log(`  Segments generados: ${count || 0}`);
      if (segments && segments.length > 0) {
        segments.forEach((seg, i) => {
            console.log(`    ${i + 1}. ${seg.origin} → ${seg.destination} ${seg.is_main_trip ? '(main)' : ''}`);
        });
      }
    }
  } else {
    console.log('⚠️  No hay trips publicados para el futuro');
  }
  
  // Consultar rutas
  const { data: routes } = await supabase
    .from('routes')
    .select('id, name, origin, destination, stops')
    .eq('company_id', companyId)
    .eq('is_active', true);
  
  console.log(`\n\n📍 Rutas activas: ${routes?.length || 0}`);
  if (routes && routes.length > 0) {
    routes.forEach((route, i) => {
      console.log(`\n${i + 1}. ${route.name}`);
      console.log(`   Origen: ${route.origin}`);
      console.log(`   Destino: ${route.destination}`);
      console.log(`   Paradas: ${route.stops?.length || 0}`);
    });
  }
}

testTrips().then(() => {
  console.log('\n✅ Consulta completada');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

