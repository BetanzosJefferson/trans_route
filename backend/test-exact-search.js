#!/usr/bin/env node
/**
 * Test con los valores EXACTOS del frontend
 */

const chalk = require('chalk');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testExactSearch() {
  console.log(chalk.cyan.bold('\n🔍 TEST: Valores Exactos del Frontend\n'));
  
  // VALORES EXACTOS DEL LOG DEL NAVEGADOR
  const filters = {
    company_id: "d8d8448b-d689-4713-a56a-0183a1a7c70f",
    main_trips_only: false,
    origin: 'Acapulco de Juarez, Guerrero|Centro',
    destination: 'Cuernavaca, Morelos|Polvorín',
    date_from: '2025-10-24T06:00:00.000Z',
    date_to: '2025-10-25T06:00:00.000Z'
  };
  
  console.log(chalk.yellow('📋 Filtros a buscar:'));
  console.log(JSON.stringify(filters, null, 2));
  console.log('');
  
  // TEST 1: Verificar si existe ALGÚN segment con ese origen
  console.log(chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  TEST 1: ¿Existe este origen en la BD?'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  const { data: originsData } = await supabase
    .from('trip_segments')
    .select('origin, destination, departure_time, available_seats')
    .eq('company_id', filters.company_id)
    .eq('origin', filters.origin)
    .gte('departure_time', filters.date_from)
    .lte('departure_time', filters.date_to);
  
  console.log(chalk.white(`Segments con origen "${filters.origin}": ${originsData?.length || 0}\n`));
  
  if (originsData && originsData.length > 0) {
    console.log(chalk.green('✅ SÍ existe el origen en la BD'));
    console.log(chalk.bold('\nDestinos disponibles desde ese origen:'));
    const dests = [...new Set(originsData.map(s => s.destination))];
    dests.forEach((d, i) => {
      const [loc, name] = d.split('|');
      console.log(`   ${i + 1}. ${name || loc} ${chalk.gray(`(${d})`)}`);
    });
  } else {
    console.log(chalk.red('❌ NO existe el origen en la BD'));
    console.log(chalk.yellow('\n🔍 Buscando orígenes similares...'));
    
    const { data: allOrigins } = await supabase
      .from('trip_segments')
      .select('origin')
      .eq('company_id', filters.company_id)
      .gte('departure_time', filters.date_from)
      .lte('departure_time', filters.date_to);
    
    const uniqueOrigins = [...new Set(allOrigins?.map(s => s.origin) || [])];
    console.log(chalk.white(`\nOrígenes disponibles (${uniqueOrigins.length}):`));
    uniqueOrigins.forEach((o, i) => {
      const [loc, name] = o.split('|');
      console.log(`   ${i + 1}. ${name || loc} ${chalk.gray(`(${o})`)}`);
      
      // Comparar con el valor buscado
      if (o.toLowerCase().includes('acapulco')) {
        console.log(chalk.yellow(`      ⚠️  SIMILAR a lo que buscas`));
        console.log(chalk.gray(`      Buscado: "${filters.origin}"`));
        console.log(chalk.gray(`      En BD:    "${o}"`));
        console.log(chalk.yellow(`      ¿Son EXACTAMENTE iguales? ${o === filters.origin ? 'SÍ' : 'NO'}`));
      }
    });
  }
  
  // TEST 2: Verificar si existe el destino
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  TEST 2: ¿Existe este destino en la BD?'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  const { data: destsData } = await supabase
    .from('trip_segments')
    .select('destination')
    .eq('company_id', filters.company_id)
    .eq('destination', filters.destination)
    .gte('departure_time', filters.date_from)
    .lte('departure_time', filters.date_to);
  
  console.log(chalk.white(`Segments con destino "${filters.destination}": ${destsData?.length || 0}\n`));
  
  if (!destsData || destsData.length === 0) {
    console.log(chalk.red('❌ NO existe el destino en la BD'));
    console.log(chalk.yellow('\n🔍 Buscando destinos similares...'));
    
    const { data: allDests } = await supabase
      .from('trip_segments')
      .select('destination')
      .eq('company_id', filters.company_id)
      .gte('departure_time', filters.date_from)
      .lte('departure_time', filters.date_to);
    
    const uniqueDests = [...new Set(allDests?.map(s => s.destination) || [])];
    console.log(chalk.white(`\nDestinos disponibles (${uniqueDests.length}):`));
    uniqueDests.forEach((d, i) => {
      const [loc, name] = d.split('|');
      console.log(`   ${i + 1}. ${name || loc} ${chalk.gray(`(${d})`)}`);
      
      // Comparar con el valor buscado
      if (d.toLowerCase().includes('cuernavaca')) {
        console.log(chalk.yellow(`      ⚠️  SIMILAR a lo que buscas`));
        console.log(chalk.gray(`      Buscado: "${filters.destination}"`));
        console.log(chalk.gray(`      En BD:    "${d}"`));
        console.log(chalk.yellow(`      ¿Son EXACTAMENTE iguales? ${d === filters.destination ? 'SÍ' : 'NO'}`));
      }
    });
  }
  
  // TEST 3: Búsqueda exacta (simulando el backend)
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  TEST 3: Búsqueda Exacta (Simulando Backend)'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  let query = supabase
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
    .gte('departure_time', filters.date_from)
    .lte('departure_time', filters.date_to)
    .gt('available_seats', 0);
  
  query = query.eq('company_id', filters.company_id);
  query = query.eq('origin', filters.origin);
  query = query.eq('destination', filters.destination);
  
  // main_trips_only = false significa NO filtrar
  if (filters.main_trips_only !== false) {
    query = query.eq('is_main_trip', true);
  }
  
  query = query.order('departure_time', { ascending: true });
  
  const { data: searchResults, error } = await query;
  
  if (error) {
    console.log(chalk.red('❌ Error en la consulta:'), error.message);
  } else {
    console.log(chalk.green(`✅ Resultados: ${searchResults?.length || 0}\n`));
    
    if (searchResults && searchResults.length > 0) {
      console.log(chalk.bold('🚌 Viajes encontrados:\n'));
      searchResults.forEach((seg, i) => {
        console.log(`${i + 1}. ${seg.trip?.route?.name || 'Sin nombre'}`);
        console.log(chalk.gray(`   ${seg.origin} → ${seg.destination}`));
        console.log(chalk.gray(`   Hora: ${new Date(seg.departure_time).toLocaleString()}`));
        console.log(chalk.gray(`   Asientos: ${seg.available_seats}, Precio: $${seg.price}\n`));
      });
    } else {
      console.log(chalk.yellow('⚠️  NO se encontraron viajes\n'));
    }
  }
  
  // TEST 4: Verificar si HAY viajes para esa company_id y fechas
  console.log(chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  TEST 4: ¿Hay ALGÚN viaje para esa empresa y fecha?'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  const { data: anyTrips } = await supabase
    .from('trip_segments')
    .select('id, origin, destination')
    .eq('company_id', filters.company_id)
    .gte('departure_time', filters.date_from)
    .lte('departure_time', filters.date_to)
    .gt('available_seats', 0);
  
  console.log(chalk.white(`Total segments disponibles: ${anyTrips?.length || 0}\n`));
  
  if (!anyTrips || anyTrips.length === 0) {
    console.log(chalk.red('❌ NO hay ningún viaje para esa empresa en esas fechas'));
    console.log(chalk.yellow('   Necesitas crear viajes primero'));
  }
  
  // CONCLUSIÓN
  console.log(chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  CONCLUSIÓN'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  if (searchResults && searchResults.length > 0) {
    console.log(chalk.green('✅ TODO ESTÁ BIEN: El backend encuentra viajes'));
    console.log(chalk.yellow('💡 El problema puede ser:'));
    console.log(chalk.yellow('   1. Cache del navegador'));
    console.log(chalk.yellow('   2. El frontend no está procesando la respuesta correctamente'));
  } else if (originsData && originsData.length > 0) {
    console.log(chalk.yellow('⚠️  PROBLEMA: El origen existe pero no hay viajes a ese destino'));
    console.log(chalk.yellow('💡 Posibles causas:'));
    console.log(chalk.yellow('   1. No hay ruta directa de ese origen a ese destino'));
    console.log(chalk.yellow('   2. Los viajes están llenos (available_seats = 0)'));
    console.log(chalk.yellow('   3. El destino está mal escrito'));
  } else {
    console.log(chalk.red('❌ PROBLEMA: El origen NO existe en la BD con ese formato exacto'));
    console.log(chalk.yellow('💡 Solución:'));
    console.log(chalk.yellow('   - Verifica que los datos en getAvailableOrigins() coincidan'));
    console.log(chalk.yellow('   - Revisa los orígenes similares mostrados arriba'));
  }
}

testExactSearch()
  .then(() => {
    console.log(chalk.green('\n✅ Test completado\n'));
    process.exit(0);
  })
  .catch(err => {
    console.error(chalk.red('\n❌ Error:'), err);
    process.exit(1);
  });

