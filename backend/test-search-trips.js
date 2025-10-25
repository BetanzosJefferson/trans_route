#!/usr/bin/env node
/**
 * Test de búsqueda de viajes
 * Diagnóstico del problema: "No hay viajes con los filtros seleccionados"
 */

const chalk = require('chalk');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testSearchTrips() {
  console.log(chalk.cyan.bold('\n🔍 TEST: Búsqueda de Viajes\n'));
  
  // Obtener company
  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .limit(1)
    .single();
  
  if (!company) {
    console.log(chalk.red('❌ No hay empresa en la BD'));
    return;
  }
  
  console.log(chalk.green(`✅ Empresa: ${company.name}\n`));
  
  // Rango de fechas (hoy)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  console.log(chalk.blue(`📅 Fecha: ${today.toLocaleDateString()}`));
  console.log(chalk.gray(`   Desde: ${today.toISOString()}`));
  console.log(chalk.gray(`   Hasta: ${tomorrow.toISOString()}\n`));
  
  // TEST 1: Obtener todos los trip_segments disponibles
  console.log(chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  TEST 1: Todos los trip_segments disponibles'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  const { data: allSegments } = await supabase
    .from('trip_segments')
    .select('id, origin, destination, departure_time, available_seats, is_main_trip')
    .eq('company_id', company.id)
    .gte('departure_time', today.toISOString())
    .lte('departure_time', tomorrow.toISOString())
    .gt('available_seats', 0)
    .order('departure_time');
  
  console.log(chalk.green(`✅ Total segments encontrados: ${allSegments?.length || 0}\n`));
  
  if (!allSegments || allSegments.length === 0) {
    console.log(chalk.yellow('⚠️  No hay trip_segments para hoy'));
    console.log(chalk.yellow('   Necesitas crear viajes primero\n'));
    return;
  }
  
  // Mostrar primeros 5
  console.log(chalk.bold('📋 Primeros 5 segments:\n'));
  allSegments.slice(0, 5).forEach((seg, i) => {
    const badge = seg.is_main_trip ? chalk.blue('[Main]') : chalk.gray('[Intermedio]');
    console.log(`${i + 1}. ${badge} ${seg.origin} → ${seg.destination}`);
    console.log(chalk.gray(`   Hora: ${new Date(seg.departure_time).toLocaleTimeString()}, Asientos: ${seg.available_seats}`));
  });
  
  // TEST 2: Obtener orígenes y destinos únicos
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  TEST 2: Orígenes y Destinos Únicos'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  const origins = [...new Set(allSegments.map(s => s.origin))];
  const destinations = [...new Set(allSegments.map(s => s.destination))];
  
  console.log(chalk.bold(`📍 Orígenes únicos (${origins.length}):`));
  origins.forEach((o, i) => {
    const [loc, name] = o.split('|');
    console.log(`   ${i + 1}. ${name || loc} ${chalk.gray(`(${o})`)}`);
  });
  
  console.log('\n' + chalk.bold(`📍 Destinos únicos (${destinations.length}):`));
  destinations.forEach((d, i) => {
    const [loc, name] = d.split('|');
    console.log(`   ${i + 1}. ${name || loc} ${chalk.gray(`(${d})`)}`);
  });
  
  // TEST 3: Simular búsqueda específica
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  TEST 3: Búsqueda con Origen y Destino Específico'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  // Tomar el primer origen y el primer destino
  const testOrigin = origins[0];
  const testDestination = destinations[0];
  
  console.log(chalk.yellow(`🎯 Probando búsqueda:`));
  console.log(chalk.white(`   Origen: ${testOrigin}`));
  console.log(chalk.white(`   Destino: ${testDestination}\n`));
  
  // Búsqueda CON main_trips_only = false (como debe estar cuando hay origen/destino)
  const { data: searchResults } = await supabase
    .from('trip_segments')
    .select(`
      *,
      trip:trips(
        id,
        departure_datetime,
        capacity,
        route:routes(name)
      )
    `)
    .eq('company_id', company.id)
    .eq('origin', testOrigin)
    .eq('destination', testDestination)
    .gte('departure_time', today.toISOString())
    .lte('departure_time', tomorrow.toISOString())
    .gt('available_seats', 0)
    .order('departure_time');
  
  console.log(chalk.green(`✅ Resultados encontrados: ${searchResults?.length || 0}\n`));
  
  if (searchResults && searchResults.length > 0) {
    console.log(chalk.bold('🚌 Viajes encontrados:\n'));
    searchResults.forEach((seg, i) => {
      console.log(`${i + 1}. ${seg.trip?.route?.name || 'Sin nombre'}`);
      console.log(chalk.gray(`   ${seg.origin} → ${seg.destination}`));
      console.log(chalk.gray(`   Hora: ${new Date(seg.departure_time).toLocaleTimeString()}`));
      console.log(chalk.gray(`   Asientos: ${seg.available_seats}, Precio: $${seg.price}`));
      console.log(chalk.gray(`   Is Main Trip: ${seg.is_main_trip}\n`));
    });
  } else {
    console.log(chalk.yellow('⚠️  No se encontraron resultados para esta combinación'));
    console.log(chalk.yellow('   Probando con TODAS las combinaciones posibles...\n'));
    
    // Probar todas las combinaciones
    for (const origin of origins.slice(0, 3)) {
      for (const dest of destinations.slice(0, 3)) {
        const { data: test } = await supabase
          .from('trip_segments')
          .select('id')
          .eq('company_id', company.id)
          .eq('origin', origin)
          .eq('destination', dest)
          .gte('departure_time', today.toISOString())
          .lte('departure_time', tomorrow.toISOString())
          .gt('available_seats', 0);
        
        if (test && test.length > 0) {
          const [oLoc, oName] = origin.split('|');
          const [dLoc, dName] = dest.split('|');
          console.log(chalk.green(`   ✅ ${oName || oLoc} → ${dName || dLoc}: ${test.length} viaje(s)`));
        }
      }
    }
  }
  
  // TEST 4: Simular búsqueda CON main_trips_only = true
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  TEST 4: Búsqueda con main_trips_only = true'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  const { data: mainTripsResults } = await supabase
    .from('trip_segments')
    .select('*')
    .eq('company_id', company.id)
    .eq('is_main_trip', true)
    .gte('departure_time', today.toISOString())
    .lte('departure_time', tomorrow.toISOString())
    .gt('available_seats', 0)
    .order('departure_time');
  
  console.log(chalk.green(`✅ Main trips encontrados: ${mainTripsResults?.length || 0}\n`));
  
  if (mainTripsResults && mainTripsResults.length > 0) {
    console.log(chalk.bold('🚌 Main Trips:\n'));
    mainTripsResults.forEach((seg, i) => {
      console.log(`${i + 1}. ${seg.origin} → ${seg.destination}`);
      console.log(chalk.gray(`   Hora: ${new Date(seg.departure_time).toLocaleTimeString()}`));
    });
  }
  
  // TEST 5: Verificar formato de valores
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  TEST 5: Formato de Valores'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  console.log(chalk.bold('🔍 Verificando formato de origen/destino:\n'));
  
  const sampleSegment = allSegments[0];
  console.log(chalk.white('Ejemplo de segment en BD:'));
  console.log(chalk.gray(`   origin: "${sampleSegment.origin}"`));
  console.log(chalk.gray(`   destination: "${sampleSegment.destination}"`));
  console.log(chalk.gray(`   Formato esperado: "Location|StopName"\n`));
  
  // Verificar si todos tienen el formato correcto
  const hasCorrectFormat = allSegments.every(s => {
    return s.origin.includes('|') && s.destination.includes('|');
  });
  
  if (hasCorrectFormat) {
    console.log(chalk.green('✅ Todos los segments tienen el formato correcto\n'));
  } else {
    console.log(chalk.red('❌ PROBLEMA: Algunos segments NO tienen el formato correcto\n'));
    
    const incorrectSegments = allSegments.filter(s => {
      return !s.origin.includes('|') || !s.destination.includes('|');
    });
    
    console.log(chalk.yellow('Segments con formato incorrecto:'));
    incorrectSegments.forEach(seg => {
      console.log(`   - origin: "${seg.origin}"`);
      console.log(`     destination: "${seg.destination}"\n`);
    });
  }
  
  // CONCLUSIÓN
  console.log(chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  CONCLUSIÓN'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  console.log(chalk.bold('📊 Resumen:\n'));
  console.log(chalk.white(`   • Total segments disponibles: ${allSegments.length}`));
  console.log(chalk.white(`   • Orígenes únicos: ${origins.length}`));
  console.log(chalk.white(`   • Destinos únicos: ${destinations.length}`));
  console.log(chalk.white(`   • Formato correcto: ${hasCorrectFormat ? '✅ Sí' : '❌ No'}`));
  
  if (searchResults && searchResults.length > 0) {
    console.log(chalk.green(`   • Búsqueda de prueba: ✅ ${searchResults.length} resultado(s)\n`));
  } else {
    console.log(chalk.yellow(`   • Búsqueda de prueba: ⚠️  Sin resultados\n`));
    console.log(chalk.yellow('💡 POSIBLES CAUSAS:'));
    console.log(chalk.yellow('   1. Los valores enviados desde el frontend no coinciden exactamente'));
    console.log(chalk.yellow('   2. El filtro main_trips_only está interfiriendo'));
    console.log(chalk.yellow('   3. No hay combinación válida de origen → destino para hoy'));
  }
}

testSearchTrips()
  .then(() => {
    console.log(chalk.green('\n✅ Test completado\n'));
    process.exit(0);
  })
  .catch(err => {
    console.error(chalk.red('\n❌ Error:'), err);
    process.exit(1);
  });

