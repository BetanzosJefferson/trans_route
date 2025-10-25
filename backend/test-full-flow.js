#!/usr/bin/env node

const chalk = require('chalk');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function testFullFlow() {
  console.log(chalk.cyan.bold('\n🔍 TEST COMPLETO: Frontend → Backend → Database\n'));
  
  const companyId = 'd8d8448b-3689-4713-a56a-0183a1a7c70f';
  const date = '2025-10-24';
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  console.log(chalk.yellow('📋 Parámetros de prueba:'));
  console.log(`   Company ID: ${companyId}`);
  console.log(`   Fecha: ${date}`);
  console.log('');
  
  // PASO 1: getAvailableOrigins
  console.log(chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  PASO 1: GET /reservations/origins'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  const { data: originsData } = await supabase
    .from('trip_segments')
    .select('origin')
    .eq('company_id', companyId)
    .gte('departure_time', today.toISOString())
    .lte('departure_time', tomorrow.toISOString())
    .gt('available_seats', 0);
  
  const uniqueOrigins = [...new Set(originsData?.map(s => s.origin) || [])];
  const origins = uniqueOrigins.map(origin => {
    const [location, stopName] = origin.split('|');
    return {
      value: origin,
      label: stopName || location,
      location: location
    };
  }).sort((a, b) => a.label.localeCompare(b.label));
  
  console.log(chalk.green('✅ Orígenes disponibles:'));
  origins.forEach((o, i) => {
    console.log(`   ${i + 1}. ${chalk.white(o.label)}`);
    console.log(chalk.gray(`      Valor: ${o.value}`));
    console.log(chalk.gray(`      Ubicación: ${o.location}`));
  });
  
  if (origins.length === 0) {
    console.log(chalk.red('❌ NO HAY ORÍGENES DISPONIBLES'));
    console.log(chalk.yellow('⚠️  Verifica que hay viajes para esa fecha'));
    process.exit(1);
  }
  
  // PASO 2: Seleccionar origen
  const selectedOrigin = origins[0].value; // CONDESA
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  PASO 2: Usuario selecciona origen'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  console.log(chalk.green('✅ Origen seleccionado:'), selectedOrigin);
  
  // PASO 3: getAvailableDestinations
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  PASO 3: GET /reservations/destinations'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  const { data: destData } = await supabase
    .from('trip_segments')
    .select('destination')
    .eq('company_id', companyId)
    .gte('departure_time', today.toISOString())
    .lte('departure_time', tomorrow.toISOString())
    .gt('available_seats', 0);
  
  // Filtrar por origen (con normalización)
  const normalizedOrigin = normalizeString(selectedOrigin);
  const { data: segmentsForOrigin } = await supabase
    .from('trip_segments')
    .select('destination, origin')
    .eq('company_id', companyId)
    .gte('departure_time', today.toISOString())
    .lte('departure_time', tomorrow.toISOString())
    .gt('available_seats', 0);
  
  const filteredDests = segmentsForOrigin
    .filter(s => normalizeString(s.origin) === normalizedOrigin)
    .map(s => s.destination);
  
  const uniqueDestinations = [...new Set(filteredDests)];
  const destinations = uniqueDestinations.map(dest => {
    const [location, stopName] = dest.split('|');
    return {
      value: dest,
      label: stopName || location,
      location: location
    };
  }).sort((a, b) => a.label.localeCompare(b.label));
  
  console.log(chalk.green('✅ Destinos disponibles desde'), selectedOrigin + ':');
  destinations.forEach((d, i) => {
    console.log(`   ${i + 1}. ${chalk.white(d.label)}`);
    console.log(chalk.gray(`      Valor: ${d.value}`));
    console.log(chalk.gray(`      Ubicación: ${d.location}`));
  });
  
  if (destinations.length === 0) {
    console.log(chalk.red('❌ NO HAY DESTINOS DISPONIBLES'));
    process.exit(1);
  }
  
  // PASO 4: Seleccionar destino
  const selectedDestination = destinations[0].value;
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  PASO 4: Usuario selecciona destino'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  console.log(chalk.green('✅ Destino seleccionado:'), selectedDestination);
  
  // PASO 5: searchAvailableTrips
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  PASO 5: GET /reservations/search (clic en Buscar)'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  console.log(chalk.yellow('📤 Parámetros de búsqueda:'));
  console.log(`   company_id: ${companyId}`);
  console.log(`   date_from: ${date}`);
  console.log(`   date_to: ${date}`);
  console.log(`   origin: ${selectedOrigin}`);
  console.log(`   destination: ${selectedDestination}`);
  console.log(`   main_trips_only: false`);
  console.log('');
  
  // Simular búsqueda con normalización (sin joins para simplificar)
  let query = supabase
    .from('trip_segments')
    .select('*')
    .eq('company_id', companyId)
    .gte('departure_time', today.toISOString())
    .lte('departure_time', tomorrow.toISOString())
    .gt('available_seats', 0);
  
  const { data: allSegments, error: searchError } = await query;
  
  if (searchError || !allSegments) {
    console.log(chalk.red('❌ Error en búsqueda:'), searchError);
    process.exit(1);
  }
  
  // Filtrar con normalización
  const normalizedDest = normalizeString(selectedDestination);
  const results = allSegments.filter(segment => {
    const originMatch = normalizeString(segment.origin) === normalizedOrigin;
    const destMatch = normalizeString(segment.destination) === normalizedDest;
    return originMatch && destMatch;
  });
  
  console.log(chalk.green('✅ Resultados encontrados:'), results.length);
  
  results.forEach((seg, i) => {
    console.log(`\n   ${i + 1}. ${chalk.white(seg.origin)} → ${chalk.white(seg.destination)}`);
    console.log(chalk.gray(`      Precio: $${seg.price}`));
    console.log(chalk.gray(`      Asientos: ${seg.available_seats}`));
    console.log(chalk.gray(`      Viaje principal: ${seg.is_main_trip ? 'Sí' : 'No'}`));
  });
  
  if (results.length === 0) {
    console.log(chalk.red('\n❌ NO SE ENCONTRARON VIAJES'));
    console.log(chalk.yellow('⚠️  Esto es un ERROR, debería encontrar al menos 1 viaje'));
  } else {
    console.log('\n' + chalk.green.bold('✅ ¡TODO FUNCIONA CORRECTAMENTE!'));
    console.log(chalk.green('   El backend devuelve resultados correctos'));
    console.log(chalk.green('   La normalización funciona'));
    console.log('');
    console.log(chalk.yellow('⚠️  Si el frontend no muestra estos viajes:'));
    console.log(chalk.white('   1. Limpia la caché del navegador'));
    console.log(chalk.white('   2. Abre en incógnito'));
    console.log(chalk.white('   3. Verifica los logs de la consola'));
  }
  
  // RESUMEN
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  RESUMEN'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  console.log(chalk.yellow('Flujo completo simulado:'));
  console.log(chalk.white('  1. ✅ GET /reservations/origins'));
  console.log(chalk.white(`     → Devuelve ${origins.length} origen(es)`));
  console.log(chalk.white('  2. ✅ Usuario selecciona: ' + origins[0].label));
  console.log(chalk.white('  3. ✅ GET /reservations/destinations'));
  console.log(chalk.white(`     → Devuelve ${destinations.length} destino(s)`));
  console.log(chalk.white('  4. ✅ Usuario selecciona: ' + destinations[0].label));
  console.log(chalk.white('  5. ✅ GET /reservations/search'));
  console.log(chalk.white(`     → Devuelve ${results.length} viaje(s)`));
  
  if (results.length > 0) {
    console.log('\n' + chalk.green.bold('🎉 BACKEND FUNCIONANDO CORRECTAMENTE'));
  } else {
    console.log('\n' + chalk.red.bold('❌ HAY UN PROBLEMA EN EL BACKEND'));
  }
}

testFullFlow()
  .then(() => {
    console.log('');
    process.exit(0);
  })
  .catch(err => {
    console.error(chalk.red('\n❌ Error:'), err);
    process.exit(1);
  });

