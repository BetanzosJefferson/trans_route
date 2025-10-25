# 🧪 HERRAMIENTAS DE TESTING - TransRoute Backend

## 📦 ¿Qué se ha creado?

He creado **3 herramientas de testing** que se conectan directamente al backend sin necesidad de autenticación:

### 1. **CLI Interactiva Completa** (Recomendado) ⭐

**Archivo:** `backend/cli-test.js`

**Características:**
- ✅ Menú interactivo con 6 opciones
- ✅ Colores y formato visual
- ✅ Simula EXACTAMENTE lo que hace el backend
- ✅ Prueba todos los endpoints principales
- ✅ Sin necesidad de JWT o autenticación

**Uso:**
```bash
cd backend
node cli-test.js
```

**Tests disponibles:**
1. 🎯 Obtener Orígenes Disponibles (getAvailableOrigins)
2. 🎯 Obtener Destinos Disponibles (getAvailableDestinations)
3. 🚌 Buscar Viajes Disponibles (searchAvailableTrips)
4. ⚖️ Comparar Filtros (Main Trips vs Todos)
5. 📊 Estadísticas de Base de Datos
6. 💻 Consulta SQL Personalizada

---

### 2. **Test Rápido de Orígenes**

**Archivo:** `backend/quick-test-origins.js`

**Características:**
- ✅ Ejecución inmediata sin menú
- ✅ Enfocado específicamente en orígenes
- ✅ Análisis automático de main trips vs intermedios
- ✅ Muestra JSON listo para comparar con frontend

**Uso:**
```bash
cd backend
node quick-test-origins.js
```

**Salida:**
- Total de segments encontrados
- Orígenes únicos
- Diferencia entre main trips e intermedios
- JSON completo para comparar

---

### 3. **Tests Existentes**

**Archivos:** `backend/test-origins.js`, `backend/test-trips.js`

Estos ya existían y siguen disponibles para consultas específicas.

---

## 🚀 INICIO RÁPIDO

### Para el problema específico de orígenes:

```bash
cd /Users/williambe/Documents/transroute/backend

# Test rápido y directo
node quick-test-origins.js

# O menú interactivo completo
node cli-test.js
# Luego selecciona opción 1
```

---

## 📊 ¿QUÉ DEBERÍAS VER?

### ✅ Si todo está CORRECTO:

```
🧪 TEST RÁPIDO: Orígenes Disponibles

✅ Empresa: Tu Empresa
📅 Fecha: 24/10/2025

═══════════════════════════════════════════════════════════
  RESULTADO DE LA CONSULTA
═══════════════════════════════════════════════════════════

✅ Total segments encontrados: 24
✅ Orígenes únicos: 6

📊 ANÁLISIS:
   Segments que son main trips: 4/24
   Orígenes de main trips: 2/6

📍 ORÍGENES DISPONIBLES:

🚏 1. Terminal [Intermedio]
   📍 Aguascalientes
   🔑 Aguascalientes|Terminal

🚌 2. Terminal TAPO [Main]
   📍 Ciudad de México, CDMX
   🔑 Ciudad de México, CDMX|Terminal TAPO

🚌 3. Terminal de Autobuses [Main]
   📍 Guadalajara, Jalisco
   🔑 Guadalajara, Jalisco|Terminal de Autobuses

🚏 4. Terminal León [Intermedio]
   📍 León, Guanajuato
   🔑 León, Guanajuato|Terminal León

🚏 5. Terminal QRO [Intermedio]
   📍 Querétaro, Querétaro
   🔑 Querétaro, Querétaro|Terminal QRO

🚏 6. Terminal [Intermedio]
   📍 Zacatecas
   🔑 Zacatecas|Terminal

═══════════════════════════════════════════════════════════
  CONCLUSIÓN
═══════════════════════════════════════════════════════════

✅ TODO CORRECTO:
   Se están mostrando TODOS los orígenes (6 total)
   Incluye 4 paradas intermedias
```

---

### ❌ Si hay PROBLEMA:

```
✅ Total segments encontrados: 4
✅ Orígenes únicos: 2

📊 ANÁLISIS:
   Segments que son main trips: 4/4
   Orígenes de main trips: 2/2

📍 ORÍGENES DISPONIBLES:

🚌 1. Terminal TAPO [Main]
   📍 Ciudad de México, CDMX
   🔑 Ciudad de México, CDMX|Terminal TAPO

🚌 2. Terminal de Autobuses [Main]
   📍 Guadalajara, Jalisco
   🔑 Guadalajara, Jalisco|Terminal de Autobuses

═══════════════════════════════════════════════════════════
  CONCLUSIÓN
═══════════════════════════════════════════════════════════

❌ PROBLEMA DETECTADO:
   Solo se están mostrando orígenes de main trips
   Faltan las paradas intermedias
```

---

## 🎯 FLUJO DE DIAGNÓSTICO RECOMENDADO

### Paso 1: Test Rápido
```bash
node quick-test-origins.js
```

**Pregunta:** ¿Muestra 6 orígenes o solo 2?

- **Si muestra 6:** ✅ Backend está bien → El problema es frontend o cache
- **Si muestra 2:** ❌ Backend tiene problema → Continúa al Paso 2

---

### Paso 2: CLI Interactiva - Comparación
```bash
node cli-test.js
# Selecciona opción 4 (Comparar Filtros)
```

**Pregunta:** ¿Hay diferencia entre SIN filtro y CON filtro?

- **Si hay diferencia:** El código fuente está bien, el compilado puede estar obsoleto
- **Si NO hay diferencia:** El filtro `is_main_trip` está en el código fuente

---

### Paso 3: Verificar código compilado
```bash
grep -n "is_main_trip" dist/modules/reservations/reservations.service.js
```

**Pregunta:** ¿Aparece en `getAvailableOrigins`?

- **Si aparece:** El código fuente tiene el filtro (problema en src/)
- **Si NO aparece:** El código está bien (problema de cache del navegador)

---

### Paso 4: Verificar frontend
1. Abre Chrome en modo incógnito
2. Abre DevTools (F12) > Console
3. Ve a la página Nueva Reserva
4. Revisa los console.logs que agregamos

**Pregunta:** ¿Cuántos orígenes muestra el console.log del frontend?

- **Si muestra 6:** El API devuelve bien, pero el Combobox no los muestra
- **Si muestra 2:** El frontend está llamando al endpoint equivocado o con filtros

---

## 🔧 ARCHIVOS INVOLUCRADOS EN EL FLUJO

### Backend:
```
1. reservations.controller.ts (líneas 43-51)
   ↓ recibe HTTP request
   
2. reservations.service.ts (líneas 117-145)
   ↓ ejecuta lógica
   
3. supabase.service.ts
   ↓ conecta a DB
   
4. Base de datos → trip_segments
```

### Frontend:
```
1. page.tsx → loadOrigins() (líneas 83-107)
   ↓ llama al API
   
2. api.ts → getAvailableOrigins() (líneas 178-181)
   ↓ HTTP request
   
3. combobox.tsx (componente UI)
   ↓ muestra opciones
```

---

## 💡 TIPS DE USO

### CLI Interactiva:
- Usa **opción 1** para el test de orígenes
- Usa **opción 4** para comparar filtros
- Usa **opción 5** para ver estadísticas rápidas
- El JSON que muestra es EXACTAMENTE lo que debería recibir el frontend

### Test Rápido:
- Ejecución en 2 segundos
- Análisis automático del problema
- Perfecto para ejecutar después de cada cambio en el código

### Comparación con Frontend:
1. Ejecuta `quick-test-origins.js`
2. Copia el JSON que muestra
3. Abre DevTools en el navegador
4. Compara con la respuesta del endpoint `/reservations/origins`

---

## 📚 DOCUMENTACIÓN COMPLETA

Lee el archivo `backend/README-CLI.md` para:
- Descripción detallada de cada test
- Interpretación de resultados
- Casos de uso específicos
- Tips de debugging

---

## 🎓 EJEMPLOS DE USO

### Ejemplo 1: Verificar orígenes disponibles

```bash
cd backend
node quick-test-origins.js
```

Te dirá inmediatamente si el problema es main trips vs todos.

---

### Ejemplo 2: Probar el flujo completo origen → destino

```bash
cd backend
node cli-test.js
```

1. Selecciona opción 1 → Ver orígenes
2. Copia un valor de origen (ej: "Ciudad de México, CDMX|Terminal TAPO")
3. Selecciona opción 2 → Ver destinos
4. Pega el origen cuando te lo pida
5. Verifica que muestra destinos

---

### Ejemplo 3: Estadísticas rápidas

```bash
cd backend
node cli-test.js
```

Selecciona opción 5 para ver:
- Cuántos viajes hay
- Cuántos segments hay
- Cuántos segments hay HOY
- Etc.

---

## ⚡ COMANDOS RÁPIDOS

```bash
# Test más rápido (2 segundos)
node quick-test-origins.js

# CLI completa (interactiva)
node cli-test.js

# Verificar código compilado
grep -n "is_main_trip" dist/modules/reservations/reservations.service.js

# Ver últimos logs del backend
tail -f backend.log
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot find module 'inquirer'"
```bash
cd backend
npm install inquirer@8 chalk@4 --save-dev
```

### Error: "SUPABASE_URL is not defined"
Verifica que el archivo `.env` existe en `backend/` con:
```
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

### No muestra datos
Verifica que hay trip_segments para hoy:
```bash
node cli-test.js
# Selecciona opción 5 (Estadísticas)
```

---

## 📞 SIGUIENTE PASO

**Ejecuta ahora:**
```bash
cd /Users/williambe/Documents/transroute/backend
node quick-test-origins.js
```

Y dime qué resultado obtienes. Con eso sabremos exactamente dónde está el problema.

