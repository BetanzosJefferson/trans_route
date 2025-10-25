#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurar Supabase con SERVICE KEY (sin autenticación)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Obtener company_id automáticamente
let COMPANY_ID = null;

async function loadCompanyId() {
  if (COMPANY_ID) return COMPANY_ID;
  
  const { data } = await supabase
    .from('companies')
    .select('id, name')
    .limit(1)
    .single();
  
  if (data) {
    COMPANY_ID = data.id;
    console.log(chalk.green(`✅ Empresa: ${data.name} (${data.id})`));
  }
  return COMPANY_ID;
}

// Funciones de utilidad
function printHeader(title) {
  console.log('\n' + chalk.cyan.bold('═'.repeat(60)));
  console.log(chalk.cyan.bold(`  ${title}`));
  console.log(chalk.cyan.bold('═'.repeat(60)) + '\n');
}

function printSuccess(message) {
  console.log(chalk.green('✅ ' + message));
}

function printError(message) {
  console.log(chalk.red('❌ ' + message));
}

function printInfo(message) {
  console.log(chalk.blue('ℹ️  ' + message));
}

function printData(label, value) {
  console.log(chalk.yellow(`${label}:`), JSON.stringify(value, null, 2));
}

// ============================================================================
// TESTS DE ENDPOINTS
// ============================================================================

async function testGetAvailableOrigins() {
  printHeader('TEST: Obtener Orígenes Disponibles');
  
  const companyId = await loadCompanyId();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  printInfo(`Fecha desde: ${today.toISOString()}`);
  printInfo(`Fecha hasta: ${tomorrow.toISOString()}`);
  
  try {
    // Simular lo que hace el backend
    const { data, error } = await supabase
      .from('trip_segments')
      .select('origin')
      .eq('company_id', companyId)
      .gte('departure_time', today.toISOString())
      .lte('departure_time', tomorrow.toISOString())
      .gt('available_seats', 0);
    
    if (error) {
      printError(`Error: ${error.message}`);
      return;
    }
    
    // Extraer orígenes únicos
    const uniqueOrigins = Array.from(new Set(data?.map((item) => item.origin) || []));
    
    // Parsear y formatear
    const origins = uniqueOrigins.map((origin) => {
      const [location, stopName] = origin.split('|');
      return {
        value: origin,
        label: stopName || location,
        location: location,
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
    
    printSuccess(`Total segments encontrados: ${data.length}`);
    printSuccess(`Orígenes únicos: ${origins.length}`);
    
    if (origins.length > 0) {
      console.log('\n' + chalk.bold('📍 Orígenes disponibles:'));
      origins.forEach((origin, i) => {
        console.log(chalk.white(`  ${i + 1}. ${chalk.bold(origin.label)}`));
        console.log(chalk.gray(`     Ubicación: ${origin.location}`));
        console.log(chalk.gray(`     Value: ${origin.value}`));
      });
    } else {
      printError('No se encontraron orígenes para hoy');
    }
    
    console.log('\n' + chalk.magenta('📦 Respuesta JSON completa:'));
    console.log(JSON.stringify(origins, null, 2));
    
  } catch (error) {
    printError(`Error: ${error.message}`);
  }
}

async function testGetAvailableDestinations() {
  printHeader('TEST: Obtener Destinos Disponibles');
  
  const companyId = await loadCompanyId();
  
  // Primero obtener un origen
  const { answers } = await inquirer.prompt([
    {
      type: 'input',
      name: 'origin',
      message: 'Ingresa el origen (value completo, ej: "Ciudad de México, CDMX|Terminal TAPO"):',
    }
  ]);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  printInfo(`Origen: ${answers.origin}`);
  printInfo(`Fecha desde: ${today.toISOString()}`);
  printInfo(`Fecha hasta: ${tomorrow.toISOString()}`);
  
  try {
    let query = supabase
      .from('trip_segments')
      .select('destination')
      .eq('company_id', companyId)
      .gte('departure_time', today.toISOString())
      .lte('departure_time', tomorrow.toISOString())
      .gt('available_seats', 0);
    
    if (answers.origin) {
      query = query.eq('origin', answers.origin);
    }
    
    const { data, error } = await query;
    
    if (error) {
      printError(`Error: ${error.message}`);
      return;
    }
    
    const uniqueDestinations = Array.from(
      new Set(data?.map((item) => item.destination) || []),
    );
    
    const destinations = uniqueDestinations.map((destination) => {
      const [location, stopName] = destination.split('|');
      return {
        value: destination,
        label: stopName || location,
        location: location,
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
    
    printSuccess(`Total segments encontrados: ${data.length}`);
    printSuccess(`Destinos únicos: ${destinations.length}`);
    
    if (destinations.length > 0) {
      console.log('\n' + chalk.bold('📍 Destinos disponibles:'));
      destinations.forEach((dest, i) => {
        console.log(chalk.white(`  ${i + 1}. ${chalk.bold(dest.label)}`));
        console.log(chalk.gray(`     Ubicación: ${dest.location}`));
        console.log(chalk.gray(`     Value: ${dest.value}`));
      });
    } else {
      printError('No se encontraron destinos');
    }
    
    console.log('\n' + chalk.magenta('📦 Respuesta JSON completa:'));
    console.log(JSON.stringify(destinations, null, 2));
    
  } catch (error) {
    printError(`Error: ${error.message}`);
  }
}

async function testSearchTrips() {
  printHeader('TEST: Buscar Viajes Disponibles');
  
  const companyId = await loadCompanyId();
  
  const { filters } = await inquirer.prompt([
    {
      type: 'input',
      name: 'origin',
      message: 'Origen (opcional):',
    },
    {
      type: 'input',
      name: 'destination',
      message: 'Destino (opcional):',
    },
    {
      type: 'confirm',
      name: 'mainTripsOnly',
      message: '¿Solo viajes principales (main trips)?',
      default: true,
    }
  ]);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    let query = supabase
      .from('trip_segments')
      .select(`
        *,
        trip:trips(*, route:routes(*), vehicle:vehicles(*))
      `)
      .eq('company_id', companyId)
      .gte('departure_time', today.toISOString())
      .gt('available_seats', 0);
    
    if (filters.origin) {
      query = query.eq('origin', filters.origin);
    }
    
    if (filters.destination) {
      query = query.eq('destination', filters.destination);
    }
    
    if (filters.mainTripsOnly) {
      query = query.eq('is_main_trip', true);
    }
    
    query = query.order('departure_time', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
      printError(`Error: ${error.message}`);
      return;
    }
    
    printSuccess(`Viajes encontrados: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n' + chalk.bold('🚌 Viajes disponibles:'));
      data.slice(0, 5).forEach((segment, i) => {
        console.log(chalk.white(`\n  ${i + 1}. ${segment.origin} → ${segment.destination}`));
        console.log(chalk.gray(`     Salida: ${new Date(segment.departure_time).toLocaleString()}`));
        console.log(chalk.gray(`     Asientos: ${segment.available_seats}`));
        console.log(chalk.gray(`     Precio: $${segment.price}`));
        console.log(chalk.gray(`     Main trip: ${segment.is_main_trip ? 'Sí' : 'No'}`));
      });
      
      if (data.length > 5) {
        console.log(chalk.gray(`\n  ... y ${data.length - 5} más`));
      }
    }
    
  } catch (error) {
    printError(`Error: ${error.message}`);
  }
}

async function testComparisons() {
  printHeader('TEST: Comparación de Filtros (Main Trips vs Todos)');
  
  const companyId = await loadCompanyId();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  try {
    // Sin filtro is_main_trip
    const { data: allData } = await supabase
      .from('trip_segments')
      .select('origin, destination, is_main_trip')
      .eq('company_id', companyId)
      .gte('departure_time', today.toISOString())
      .lte('departure_time', tomorrow.toISOString())
      .gt('available_seats', 0);
    
    const allOrigins = [...new Set(allData?.map(s => s.origin) || [])];
    
    // Con filtro is_main_trip
    const { data: mainData } = await supabase
      .from('trip_segments')
      .select('origin, destination, is_main_trip')
      .eq('company_id', companyId)
      .eq('is_main_trip', true)
      .gte('departure_time', today.toISOString())
      .lte('departure_time', tomorrow.toISOString())
      .gt('available_seats', 0);
    
    const mainOrigins = [...new Set(mainData?.map(s => s.origin) || [])];
    
    console.log(chalk.bold('📊 SIN filtro is_main_trip:'));
    console.log(chalk.white(`   Total segments: ${allData?.length || 0}`));
    console.log(chalk.white(`   Orígenes únicos: ${allOrigins.length}`));
    allOrigins.forEach((o, i) => {
      const [loc, name] = o.split('|');
      console.log(chalk.gray(`   ${i + 1}. ${name || loc}`));
    });
    
    console.log('\n' + chalk.bold('📊 CON filtro is_main_trip = true:'));
    console.log(chalk.white(`   Total segments: ${mainData?.length || 0}`));
    console.log(chalk.white(`   Orígenes únicos: ${mainOrigins.length}`));
    mainOrigins.forEach((o, i) => {
      const [loc, name] = o.split('|');
      console.log(chalk.gray(`   ${i + 1}. ${name || loc}`));
    });
    
    console.log('\n' + chalk.bold.cyan('🎯 RESULTADO:'));
    console.log(chalk.white(`   SIN filtro: ${allOrigins.length} orígenes`));
    console.log(chalk.white(`   CON filtro: ${mainOrigins.length} orígenes`));
    console.log(chalk.yellow(`   Diferencia: ${allOrigins.length - mainOrigins.length} orígenes más`));
    
    if (allOrigins.length > mainOrigins.length) {
      printSuccess('El código SIN filtro muestra más opciones (incluye paradas intermedias)');
      
      const extraOrigins = allOrigins.filter(o => !mainOrigins.includes(o));
      console.log('\n' + chalk.bold('📍 Orígenes ADICIONALES (paradas intermedias):'));
      extraOrigins.forEach((o, i) => {
        const [loc, name] = o.split('|');
        console.log(chalk.green(`   ${i + 1}. ${name || loc} (${loc})`));
      });
    } else {
      printError('Ambos filtros dan el mismo resultado - posible problema');
    }
    
  } catch (error) {
    printError(`Error: ${error.message}`);
  }
}

async function testDatabaseStats() {
  printHeader('TEST: Estadísticas de la Base de Datos');
  
  const companyId = await loadCompanyId();
  
  try {
    // Total de viajes
    const { count: tripsCount } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);
    
    // Total de trip_segments
    const { count: segmentsCount } = await supabase
      .from('trip_segments')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);
    
    // Segments de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { count: todaySegments } = await supabase
      .from('trip_segments')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('departure_time', today.toISOString())
      .lte('departure_time', tomorrow.toISOString());
    
    // Rutas activas
    const { count: routesCount } = await supabase
      .from('routes')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true);
    
    // Reservaciones
    const { count: reservationsCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);
    
    console.log(chalk.bold('📈 Estadísticas generales:'));
    console.log(chalk.white(`   Rutas activas: ${routesCount || 0}`));
    console.log(chalk.white(`   Viajes totales: ${tripsCount || 0}`));
    console.log(chalk.white(`   Trip segments totales: ${segmentsCount || 0}`));
    console.log(chalk.white(`   Trip segments hoy: ${todaySegments || 0}`));
    console.log(chalk.white(`   Reservaciones totales: ${reservationsCount || 0}`));
    
  } catch (error) {
    printError(`Error: ${error.message}`);
  }
}

async function testRawQuery() {
  printHeader('TEST: Consulta SQL Personalizada');
  
  const { query } = await inquirer.prompt([
    {
      type: 'input',
      name: 'table',
      message: 'Nombre de la tabla:',
      default: 'trip_segments',
    },
    {
      type: 'input',
      name: 'select',
      message: 'Campos a seleccionar (ej: *, id, origin):',
      default: '*',
    },
    {
      type: 'input',
      name: 'limit',
      message: 'Límite de resultados:',
      default: '10',
    }
  ]);
  
  try {
    const { data, error } = await supabase
      .from(query.table)
      .select(query.select)
      .limit(parseInt(query.limit));
    
    if (error) {
      printError(`Error: ${error.message}`);
      return;
    }
    
    printSuccess(`Resultados: ${data?.length || 0}`);
    console.log('\n' + chalk.magenta('📦 Datos:'));
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    printError(`Error: ${error.message}`);
  }
}

// ============================================================================
// MENÚ PRINCIPAL
// ============================================================================

async function mainMenu() {
  console.clear();
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║        🧪 CLI TESTER - TransRoute Backend API            ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝\n'));
  
  await loadCompanyId();
  
  const { option } = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: chalk.bold('Selecciona un test:'),
      choices: [
        { name: '🎯 1. Obtener Orígenes Disponibles (getAvailableOrigins)', value: '1' },
        { name: '🎯 2. Obtener Destinos Disponibles (getAvailableDestinations)', value: '2' },
        { name: '🚌 3. Buscar Viajes Disponibles (searchAvailableTrips)', value: '3' },
        { name: '⚖️  4. Comparar Filtros (Main Trips vs Todos)', value: '4' },
        { name: '📊 5. Estadísticas de Base de Datos', value: '5' },
        { name: '💻 6. Consulta SQL Personalizada', value: '6' },
        new inquirer.Separator(),
        { name: '❌ Salir', value: 'exit' },
      ],
    }
  ]);
  
  console.log('');
  
  switch (option) {
    case '1':
      await testGetAvailableOrigins();
      break;
    case '2':
      await testGetAvailableDestinations();
      break;
    case '3':
      await testSearchTrips();
      break;
    case '4':
      await testComparisons();
      break;
    case '5':
      await testDatabaseStats();
      break;
    case '6':
      await testRawQuery();
      break;
    case 'exit':
      console.log(chalk.green('\n👋 ¡Hasta luego!\n'));
      process.exit(0);
  }
  
  console.log('\n');
  
  const { continuar } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continuar',
      message: '¿Ejecutar otro test?',
      default: true,
    }
  ]);
  
  if (continuar) {
    await mainMenu();
  } else {
    console.log(chalk.green('\n👋 ¡Hasta luego!\n'));
    process.exit(0);
  }
}

// ============================================================================
// INICIO
// ============================================================================

console.log(chalk.cyan('\n🔌 Conectando a la base de datos...\n'));

mainMenu().catch(err => {
  console.error(chalk.red('\n❌ Error fatal:'), err);
  process.exit(1);
});

