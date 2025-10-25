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

async function testFrontendVsBackend() {
  console.log(chalk.cyan.bold('\n🔍 TEST: Frontend vs Backend\n'));
  
  const companyId = 'd8d8448b-3689-4713-a56a-0183a1a7c70f';
  const today = new Date('2025-10-24');
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Obtener viajes reales de la BD
  const { data: segments } = await supabase
    .from('trip_segments')
    .select('origin, destination, price')
    .eq('company_id', companyId)
    .gte('departure_time', today.toISOString())
    .lte('departure_time', tomorrow.toISOString())
    .gt('available_seats', 0);
  
  console.log(chalk.yellow('📊 VIAJES EN LA BASE DE DATOS:\n'));
  segments.forEach((s, i) => {
    console.log(`${i + 1}. ${chalk.white(s.origin)} → ${chalk.white(s.destination)}`);
    console.log(chalk.gray(`   Precio: $${s.price}`));
  });
  
  // Lo que el frontend está buscando (según logs anteriores)
  const frontendSearch = {
    origin: 'Acapulco de Juarez, Guerrero|Centro',
    destination: 'Cuernavaca, Morelos|Polvorín'
  };
  
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  BÚSQUEDA DEL FRONTEND'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  console.log(chalk.yellow('Origen buscado:'), frontendSearch.origin);
  console.log(chalk.gray('Normalizado:'), normalizeString(frontendSearch.origin));
  console.log(chalk.yellow('Destino buscado:'), frontendSearch.destination);
  console.log(chalk.gray('Normalizado:'), normalizeString(frontendSearch.destination));
  
  // Buscar coincidencias
  console.log('\n' + chalk.bold('🔎 BUSCANDO COINCIDENCIAS...\n'));
  
  let foundExact = false;
  let foundOrigin = false;
  let foundDestination = false;
  
  for (const seg of segments) {
    const originMatch = normalizeString(seg.origin) === normalizeString(frontendSearch.origin);
    const destMatch = normalizeString(seg.destination) === normalizeString(frontendSearch.destination);
    
    if (originMatch && destMatch) {
      console.log(chalk.green('✅ COINCIDENCIA EXACTA ENCONTRADA!'));
      console.log(chalk.white('   Origen BD:'), seg.origin);
      console.log(chalk.white('   Destino BD:'), seg.destination);
      foundExact = true;
    }
    
    if (originMatch) {
      if (!foundOrigin) {
        console.log(chalk.blue('ℹ️  Origen coincide:'), seg.origin);
        foundOrigin = true;
      }
    }
    
    if (destMatch) {
      if (!foundDestination) {
        console.log(chalk.blue('ℹ️  Destino coincide:'), seg.destination);
        foundDestination = true;
      }
    }
  }
  
  if (!foundExact) {
    console.log(chalk.red('❌ NO SE ENCONTRÓ COINCIDENCIA EXACTA\n'));
    
    if (!foundOrigin) {
      console.log(chalk.yellow('⚠️  El origen NO existe en la BD'));
      console.log(chalk.gray('   Buscado:'), frontendSearch.origin);
      console.log(chalk.gray('   Disponibles en BD:'));
      const origins = [...new Set(segments.map(s => s.origin))];
      origins.forEach(o => {
        const [loc, name] = o.split('|');
        console.log(chalk.gray(`   • ${name || loc} (${o})`));
      });
    }
    
    if (!foundDestination) {
      console.log(chalk.yellow('\n⚠️  El destino NO existe en la BD'));
      console.log(chalk.gray('   Buscado:'), frontendSearch.destination);
      console.log(chalk.gray('   Disponibles en BD:'));
      const destinations = [...new Set(segments.map(s => s.destination))];
      destinations.forEach(d => {
        const [loc, name] = d.split('|');
        console.log(chalk.gray(`   • ${name || loc} (${d})`));
      });
    }
  }
  
  // COMBINACIÓN CORRECTA
  console.log('\n' + chalk.cyan.bold('═'.repeat(70)));
  console.log(chalk.cyan.bold('  COMBINACIÓN CORRECTA'));
  console.log(chalk.cyan.bold('═'.repeat(70)) + '\n');
  
  console.log(chalk.green('✅ Para encontrar viajes, usa:'));
  console.log(chalk.white('   Origen: Acapulco de Juarez, Guerrero|CONDESA'));
  console.log(chalk.white('   Destino: Cuernavaca, Morelos|Polvorin'));
  
  // Probar la combinación correcta
  const correctSearch = {
    origin: 'Acapulco de Juarez, Guerrero|CONDESA',
    destination: 'Cuernavaca, Morelos|Polvorin'
  };
  
  let found = false;
  for (const seg of segments) {
    if (normalizeString(seg.origin) === normalizeString(correctSearch.origin) &&
        normalizeString(seg.destination) === normalizeString(correctSearch.destination)) {
      console.log(chalk.green('\n✅ Con esta combinación SÍ se encuentra:'));
      console.log(chalk.white('   ' + seg.origin + ' → ' + seg.destination));
      console.log(chalk.white('   Precio: $' + seg.price));
      found = true;
    }
  }
  
  if (!found) {
    console.log(chalk.red('\n❌ Ni siquiera la combinación correcta funciona!'));
  }
}

testFrontendVsBackend()
  .then(() => {
    console.log(chalk.green('\n✅ Test completado\n'));
    process.exit(0);
  })
  .catch(err => {
    console.error(chalk.red('\n❌ Error:'), err);
    process.exit(1);
  });

