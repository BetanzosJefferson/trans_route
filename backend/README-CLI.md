# 🧪 CLI Tester - TransRoute Backend API

## Descripción

Interfaz de línea de comandos interactiva para testear todos los endpoints del backend sin necesidad de autenticación. Se conecta directamente a Supabase usando el SERVICE_KEY, saltándose JWT y permisos RLS.

## 🚀 Instalación

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
cd backend
npm install inquirer@8 chalk@4 --save-dev
```

## 📋 Uso

### Ejecutar la CLI

```bash
cd backend
node cli-test.js
```

### Menú Principal

Al ejecutar el script, verás un menú interactivo con las siguientes opciones:

```
╔═══════════════════════════════════════════════════════════╗
║        🧪 CLI TESTER - TransRoute Backend API            ║
╚═══════════════════════════════════════════════════════════╝

? Selecciona un test:
  🎯 1. Obtener Orígenes Disponibles (getAvailableOrigins)
  🎯 2. Obtener Destinos Disponibles (getAvailableDestinations)
  🚌 3. Buscar Viajes Disponibles (searchAvailableTrips)
  ⚖️  4. Comparar Filtros (Main Trips vs Todos)
  📊 5. Estadísticas de Base de Datos
  💻 6. Consulta SQL Personalizada
  ❌ Salir
```

---

## 🧪 Tests Disponibles

### 1. Obtener Orígenes Disponibles

**Endpoint simulado:** `GET /api/v1/reservations/origins`

**Qué hace:**
- Consulta `trip_segments` para el día actual
- Extrae todos los orígenes únicos (SIN filtro `is_main_trip`)
- Los formatea igual que el backend
- Muestra la respuesta JSON completa

**Salida esperada:**
```
✅ Total segments encontrados: 24
✅ Orígenes únicos: 6

📍 Orígenes disponibles:
  1. Terminal
     Ubicación: Aguascalientes
     Value: Aguascalientes|Terminal

  2. Terminal TAPO
     Ubicación: Ciudad de México, CDMX
     Value: Ciudad de México, CDMX|Terminal TAPO
     
  ... (6 orígenes en total)
```

**Uso:** Este es el test MÁS IMPORTANTE para diagnosticar el problema de las sugerencias de origen.

---

### 2. Obtener Destinos Disponibles

**Endpoint simulado:** `GET /api/v1/reservations/destinations`

**Qué hace:**
- Pide que ingreses un origen (formato completo: `"Ciudad de México, CDMX|Terminal TAPO"`)
- Consulta destinos disponibles desde ese origen
- Los formatea y muestra

**Uso:** Prueba las sugerencias de destino después de seleccionar un origen.

---

### 3. Buscar Viajes Disponibles

**Endpoint simulado:** `GET /api/v1/reservations/search`

**Qué hace:**
- Pregunta por filtros: origen, destino, solo main trips
- Busca viajes con esos filtros
- Muestra los primeros 5 resultados con detalles

**Uso:** Simula la búsqueda completa de viajes.

---

### 4. Comparar Filtros

**Test especial:** Compara resultados con y sin filtro `is_main_trip`

**Qué hace:**
- Ejecuta 2 queries idénticas:
  - Una SIN filtro `is_main_trip` (como debería estar el código)
  - Una CON filtro `is_main_trip = true` (para comparar)
- Muestra cuántos orígenes devuelve cada una
- Lista los orígenes adicionales (paradas intermedias)

**Salida esperada:**
```
📊 SIN filtro is_main_trip:
   Total segments: 24
   Orígenes únicos: 6

📊 CON filtro is_main_trip = true:
   Total segments: 4
   Orígenes únicos: 2

🎯 RESULTADO:
   SIN filtro: 6 orígenes
   CON filtro: 2 orígenes
   Diferencia: 4 orígenes más

✅ El código SIN filtro muestra más opciones (incluye paradas intermedias)

📍 Orígenes ADICIONALES (paradas intermedias):
   1. Terminal (Aguascalientes)
   2. Terminal León (León, Guanajuato)
   3. Terminal QRO (Querétaro, Querétaro)
   4. Terminal (Zacatecas)
```

**Uso:** Este test confirma si el filtro `is_main_trip` está causando el problema.

---

### 5. Estadísticas de Base de Datos

**Qué hace:**
- Muestra estadísticas generales:
  - Rutas activas
  - Viajes totales
  - Trip segments totales
  - Trip segments de hoy
  - Reservaciones totales

**Uso:** Vista rápida del estado de la base de datos.

---

### 6. Consulta SQL Personalizada

**Qué hace:**
- Permite ejecutar queries personalizadas
- Pide: tabla, campos, límite
- Muestra los resultados

**Uso:** Para debugging avanzado o exploración libre.

---

## 🎯 Casos de Uso Específicos

### Problema: "Solo muestra 2 orígenes en lugar de 6"

**Pasos:**
1. Ejecuta `node cli-test.js`
2. Selecciona opción **1** (Obtener Orígenes Disponibles)
3. Verifica cuántos orígenes muestra
4. Si muestra 6, el backend está bien → problema es el frontend o cache
5. Si muestra 2, hay un problema en el código del backend

Luego ejecuta opción **4** (Comparar Filtros) para confirmar si el filtro está activo.

---

### Problema: "El combobox no muestra sugerencias"

**Pasos:**
1. Ejecuta opción **1** para confirmar que hay orígenes
2. Copia uno de los valores (ej: `"Ciudad de México, CDMX|Terminal TAPO"`)
3. Ejecuta opción **2** (Destinos)
4. Pega el valor del origen
5. Verifica que devuelve destinos

---

### Problema: "No hay viajes disponibles"

**Pasos:**
1. Ejecuta opción **5** (Estadísticas)
2. Verifica si hay `trip_segments` para hoy
3. Si hay 0 segments hoy, necesitas crear viajes para hoy

---

## 🔧 Ventajas de esta CLI

1. **Sin autenticación**: Usa SERVICE_KEY, no necesita JWT
2. **Interactiva**: Menú fácil de navegar
3. **Visual**: Usa colores y formato claro
4. **Completa**: Simula EXACTAMENTE lo que hace el backend
5. **Debugging**: Muestra JSON completo para comparar
6. **Portable**: Un solo archivo, fácil de compartir

---

## 📊 Interpretación de Resultados

### ✅ Resultados CORRECTOS:

**Test 1 (Orígenes):**
- Total segments: > 0
- Orígenes únicos: 6 (o más si hay más rutas)
- Muestra orígenes con diferentes ubicaciones

**Test 4 (Comparación):**
- SIN filtro: 6 orígenes
- CON filtro: 2 orígenes
- Diferencia: 4 orígenes más
- Mensaje: "muestra más opciones"

---

### ❌ Resultados con PROBLEMA:

**Test 1 (Orígenes):**
- Orígenes únicos: 2 (solo main trips)
- Solo muestra "Terminal TAPO" y "Terminal de Autobuses"

**Test 4 (Comparación):**
- SIN filtro: 2 orígenes
- CON filtro: 2 orígenes
- Diferencia: 0
- Significa que el filtro `is_main_trip` está activo

---

## 🐛 Debugging

Si los tests muestran resultados inesperados:

1. **Verificar conexión a DB:**
   - Asegúrate que `.env` tiene las variables correctas
   - Verifica que Supabase está accesible

2. **Verificar datos:**
   - Usa opción 5 (Estadísticas) para confirmar que hay datos
   - Si `trip_segments hoy: 0`, necesitas crear viajes

3. **Comparar con backend real:**
   - Los tests simulan lo que hace el backend
   - Si el test muestra 6 pero el frontend muestra 2, el problema es frontend/cache

---

## 💡 Tips

- **Ejecuta el test después de cada cambio** en el backend
- **Compara los JSON** que muestra la CLI con los del DevTools Network
- **Usa la opción 4** (Comparar) para confirmar cambios
- **Los colores ayudan**: Verde = éxito, Rojo = error, Amarillo = datos importantes

---

## 🔄 Flujo de Testing Recomendado

```
1. Estadísticas (5) → Confirmar que hay datos
   ↓
2. Orígenes (1) → Ver cuántos orígenes hay
   ↓
3. Comparar (4) → Confirmar si el filtro está activo
   ↓
4. Destinos (2) → Probar la segunda parte del flujo
   ↓
5. Buscar (3) → Probar búsqueda completa
```

---

## 📝 Notas Técnicas

- **Conexión:** Usa `SUPABASE_SERVICE_KEY` del `.env`
- **Bypasses RLS:** Tiene permisos completos
- **Simula exactamente:** Usa el mismo código que `reservations.service.ts`
- **No afecta:** Solo lee, nunca modifica datos
- **Company ID:** Se obtiene automáticamente de la primera empresa

---

¿Problemas? Abre un issue o contacta al equipo de desarrollo.

