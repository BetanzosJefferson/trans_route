#!/usr/bin/env node
/**
 * Quick Test - Orígenes Disponibles
 * Ejecución rápida sin menú interactivo
 */

const chalk = require('chalk');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function quickTest() {
  console.log(chalk.cyan.bold('\n🧪 TEST RÁPIDO: Orígenes Disponibles\n'));
  
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
  
  console.log(chalk.green(`✅ Empresa: ${company.name}`));
  
  // Rango de fechas (hoy)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  console.log(chalk.blue(`📅 Fecha: ${today.toLocaleDateString()}`));
  console.log(chalk.gray(`   Desde: ${today.toISOString()}`));
  console.log(chalk.gray(`   Hasta: ${tomorrow.toISOString()}\n`));
  
  // Query SIN filtro is_main_trip (como debería estar)
  const { data, error } = await supabase
    .from('trip_segments')
    .select('origin, is_main_trip')
    .eq('company_id', company.id)
    .gte('departure_time', today.toISOString())
    .lte('departure_time', tomorrow.toISOString())
    .gt('available_seats', 0);
  
  if (error) {
    console.log(chalk.red(`❌ Error: ${error.message}`));
    return;
  }
  
  console.log(chalk.cyan.bold('═'.repeat(60)));
  console.log(chalk.cyan.bold('  RESULTADO DE LA CONSULTA'));
  console.log(chalk.cyan.bold('═'.repeat(60)) + '\n');
  
  // Extraer orígenes únicos
  const uniqueOrigins = Array.from(new Set(data?.map(item => item.origin) || []));
  
  // Formatear
  const origins = uniqueOrigins.map((origin) => {
    const [location, stopName] = origin.split('|');
    return {
      value: origin,
      label: stopName || location,
      location: location,
    };
  }).sort((a, b) => a.label.localeCompare(b.label));
  
  console.log(chalk.green(`✅ Total segments encontrados: ${data.length}`));
  console.log(chalk.green(`✅ Orígenes únicos: ${origins.length}\n`));
  
  if (origins.length === 0) {
    console.log(chalk.yellow('⚠️  No hay orígenes disponibles para hoy'));
    console.log(chalk.yellow('   Verifica que hay trip_segments con fecha de hoy\n'));
    return;
  }
  
  // Análisis de main trips
  const mainTrips = data.filter(s => s.is_main_trip);
  const mainOrigins = [...new Set(mainTrips.map(s => s.origin))];
  
  console.log(chalk.bold('📊 ANÁLISIS:'));
  console.log(chalk.white(`   Segments que son main trips: ${mainTrips.length}/${data.length}`));
  console.log(chalk.white(`   Orígenes de main trips: ${mainOrigins.length}/${origins.length}\n`));
  
  // Mostrar orígenes
  console.log(chalk.bold('📍 ORÍGENES DISPONIBLES:\n'));
  origins.forEach((origin, i) => {
    const isMainOrigin = mainOrigins.includes(origin.value);
    const icon = isMainOrigin ? '🚌' : '🚏';
    const badge = isMainOrigin ? chalk.blue('[Main]') : chalk.gray('[Intermedio]');
    
    console.log(`${icon} ${chalk.bold.white((i + 1) + '.')} ${chalk.bold(origin.label)} ${badge}`);
    console.log(chalk.gray(`   📍 ${origin.location}`));
    console.log(chalk.gray(`   🔑 ${origin.value}\n`));
  });
  
  // Conclusión
  console.log(chalk.cyan.bold('═'.repeat(60)));
  console.log(chalk.cyan.bold('  CONCLUSIÓN'));
  console.log(chalk.cyan.bold('═'.repeat(60)) + '\n');
  
  if (origins.length === mainOrigins.length) {
    console.log(chalk.red('❌ PROBLEMA DETECTADO:'));
    console.log(chalk.yellow('   Solo se están mostrando orígenes de main trips'));
    console.log(chalk.yellow('   Faltan las paradas intermedias\n'));
  } else if (origins.length > mainOrigins.length) {
    console.log(chalk.green('✅ TODO CORRECTO:'));
    console.log(chalk.green(`   Se están mostrando TODOS los orígenes (${origins.length} total)`));
    console.log(chalk.green(`   Incluye ${origins.length - mainOrigins.length} paradas intermedias\n`));
  }
  
  // JSON para el frontend
  console.log(chalk.magenta.bold('📦 JSON PARA EL FRONTEND:\n'));
  console.log(chalk.gray(JSON.stringify(origins, null, 2)));
  
  console.log('\n');
}

quickTest()
  .then(() => {
    console.log(chalk.green('✅ Test completado\n'));
    process.exit(0);
  })
  .catch(err => {
    console.error(chalk.red('\n❌ Error:'), err);
    process.exit(1);
  });

