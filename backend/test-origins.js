const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testOrigins() {
  console.log('🔍 Consultando trip_segments...\n');
  
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
  console.log(`✅ Empresa: ${companies[0].name} (${companyId})\n`);
  
  // Consultar trip_segments - buscar en los próximos 30 días
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + 30);
  
  const { data: segments, error } = await supabase
    .from('trip_segments')
    .select('id, origin, destination, departure_time, available_seats, is_main_trip')
    .eq('company_id', companyId)
    .gte('departure_time', today.toISOString())
    .lte('departure_time', futureDate.toISOString())
    .order('departure_time');
  
  if (error) {
    console.log('❌ Error:', error);
    return;
  }
  
  console.log(`📊 Total trip_segments próximos 30 días: ${segments?.length || 0}\n`);
  
  if (segments && segments.length > 0) {
    console.log('🚌 Primeros 5 trip_segments:');
    segments.slice(0, 5).forEach((seg, i) => {
      console.log(`\n${i + 1}. ${seg.origin} → ${seg.destination}`);
      console.log(`   Hora: ${new Date(seg.departure_time).toLocaleTimeString()}`);
      console.log(`   Asientos: ${seg.available_seats}`);
      console.log(`   Main trip: ${seg.is_main_trip ? 'Sí' : 'No'}`);
    });
    
    // Obtener orígenes únicos
    const origins = [...new Set(segments.map(s => s.origin))];
    console.log(`\n\n🎯 Orígenes únicos (${origins.length}):`);
    origins.forEach((origin, i) => {
      const [location, stopName] = origin.split('|');
      console.log(`${i + 1}. ${stopName || location} (${location})`);
    });
    
    // Obtener destinos únicos
    const destinations = [...new Set(segments.map(s => s.destination))];
    console.log(`\n\n🎯 Destinos únicos (${destinations.length}):`);
    destinations.forEach((dest, i) => {
      const [location, stopName] = dest.split('|');
      console.log(`${i + 1}. ${stopName || location} (${location})`);
    });
    
    // Filtrar solo main trips
    const mainTrips = segments.filter(s => s.is_main_trip);
    console.log(`\n\n⭐ Main trips (${mainTrips.length}):`);
    const mainOrigins = [...new Set(mainTrips.map(s => s.origin))];
    console.log(`   Orígenes: ${mainOrigins.length}`);
    mainOrigins.forEach((origin, i) => {
      const [location, stopName] = origin.split('|');
      console.log(`   ${i + 1}. ${stopName || location}`);
    });
  } else {
    console.log('⚠️  No hay trip_segments para hoy');
  }
}

testOrigins().then(() => {
  console.log('\n✅ Consulta completada');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

