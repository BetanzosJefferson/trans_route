#!/usr/bin/env node
/**
 * Test de normalización de strings
 * Verifica que la búsqueda funcione con diferencias de tildes, mayúsculas, etc.
 */

const chalk = require('chalk');

// Función de normalización (misma que en el backend)
function normalizeString(str) {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log(chalk.cyan.bold('\n🧪 TEST: Normalización de Strings\n'));

// Test cases
const testCases = [
  {
    name: 'Tildes',
    value1: 'Polvorín',
    value2: 'Polvorin',
    shouldMatch: true
  },
  {
    name: 'Mayúsculas',
    value1: 'CONDESA',
    value2: 'condesa',
    shouldMatch: true
  },
  {
    name: 'Mayúsculas + Tildes',
    value1: 'Coyoacán',
    value2: 'COYOACAN',
    shouldMatch: true
  },
  {
    name: 'Espacios extra',
    value1: 'Acapulco  de  Juarez',
    value2: 'Acapulco de Juarez',
    shouldMatch: true
  },
  {
    name: 'Diferentes palabras',
    value1: 'Centro',
    value2: 'CONDESA',
    shouldMatch: false
  },
  {
    name: 'Valor completo con pipe',
    value1: 'Acapulco de Juarez, Guerrero|CONDESA',
    value2: 'acapulco de juarez, guerrero|condesa',
    shouldMatch: true
  },
  {
    name: 'Valor completo con tildes',
    value1: 'Cuernavaca, Morelos|Polvorín',
    value2: 'Cuernavaca, Morelos|Polvorin',
    shouldMatch: true
  }
];

let passed = 0;
let failed = 0;

testCases.forEach((test, i) => {
  const normalized1 = normalizeString(test.value1);
  const normalized2 = normalizeString(test.value2);
  const matches = normalized1 === normalized2;
  const success = matches === test.shouldMatch;
  
  console.log(chalk.bold(`Test ${i + 1}: ${test.name}`));
  console.log(chalk.gray(`  Valor 1: "${test.value1}"`));
  console.log(chalk.gray(`  Valor 2: "${test.value2}"`));
  console.log(chalk.gray(`  Normalizado 1: "${normalized1}"`));
  console.log(chalk.gray(`  Normalizado 2: "${normalized2}"`));
  console.log(chalk.gray(`  ¿Coinciden? ${matches ? 'Sí' : 'No'}`));
  console.log(chalk.gray(`  ¿Esperado? ${test.shouldMatch ? 'Sí' : 'No'}`));
  
  if (success) {
    console.log(chalk.green(`  ✅ PASÓ\n`));
    passed++;
  } else {
    console.log(chalk.red(`  ❌ FALLÓ\n`));
    failed++;
  }
});

console.log(chalk.cyan.bold('═'.repeat(60)));
console.log(chalk.cyan.bold('  RESUMEN'));
console.log(chalk.cyan.bold('═'.repeat(60)) + '\n');

console.log(chalk.green(`✅ Pasados: ${passed}/${testCases.length}`));
if (failed > 0) {
  console.log(chalk.red(`❌ Fallados: ${failed}/${testCases.length}`));
}

console.log('\n' + chalk.bold('💡 Cómo funciona la normalización:\n'));
console.log(chalk.white('1. Convierte a minúsculas'));
console.log(chalk.white('2. Remueve tildes y acentos (á → a, é → e, etc.)'));
console.log(chalk.white('3. Normaliza espacios (múltiples → uno solo)'));
console.log(chalk.white('4. Quita espacios al inicio y final\n'));

console.log(chalk.yellow('🎯 Ventajas:'));
console.log(chalk.white('  ✅ "Polvorín" == "Polvorin" == "POLVORIN" == "polvorín"'));
console.log(chalk.white('  ✅ "CONDESA" == "condesa" == "Condesa"'));
console.log(chalk.white('  ✅ "Ciudad  de México" == "Ciudad de México"\n'));

console.log(chalk.green('✅ Test completado\n'));
process.exit(failed > 0 ? 1 : 0);

