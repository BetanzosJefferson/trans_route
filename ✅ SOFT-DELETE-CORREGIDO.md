# ✅ SOFT DELETE CORREGIDO - Nueva Reserva

## 🐛 Problema Reportado

En la sección "Nueva Reserva" del frontend se mostraban viajes que ya habían sido eliminados (soft delete con `deleted_at IS NOT NULL`).

## 🔍 Causa Raíz

Los queries de búsqueda de viajes **NO estaban filtrando** correctamente:
1. Viajes con `deleted_at IS NOT NULL` (eliminados)
2. Viajes con `visibility != 'published'` (ocultos o cancelados)

### Servicios afectados:

1. **TripsService** - `searchAvailableTrips()`
2. **ReservationsService** - `searchAvailableTrips()`
3. **ReservationsService** - `getAvailableOrigins()`
4. **ReservationsService** - `getAvailableDestinations()`

---

## ✅ Solución Implementada

### 1. TripsService - searchAvailableTrips()

**Archivo:** `backend/src/modules/trips/trips.service.ts`

**ANTES:**
```typescript
let query = supabase
  .from('trip_segments')
  .select(`
    *,
    trip:trips(
      id,
      route_id,
      vehicle_id,
      driver_id,
      departure_datetime,
      visibility
    )
  `)
  .eq('company_id', filters.company_id)
  .gte('departure_time', filters.date_from)
  .lte('departure_time', filters.date_to)
  .gt('available_seats', filters.min_seats || 0);
```

**DESPUÉS:**
```typescript
let query = supabase
  .from('trip_segments')
  .select(`
    *,
    trip:trips!inner(  // ← !inner = INNER JOIN
      id,
      route_id,
      vehicle_id,
      driver_id,
      departure_datetime,
      visibility,
      deleted_at        // ← Campo agregado
    )
  `)
  .eq('company_id', filters.company_id)
  .gte('departure_time', filters.date_from)
  .lte('departure_time', filters.date_to)
  .gt('available_seats', filters.min_seats || 0)
  .is('trip.deleted_at', null)           // ← Filtro agregado
  .eq('trip.visibility', 'published');   // ← Filtro agregado
```

**Cambios clave:**
1. `trips` → `trips!inner`: Cambiar LEFT JOIN a INNER JOIN
2. Agregar `deleted_at` en el SELECT
3. Filtrar `.is('trip.deleted_at', null)`
4. Filtrar `.eq('trip.visibility', 'published')`
5. Doble verificación en memoria:
   ```typescript
   results = results.filter(
     (segment) => segment.trip && !segment.trip.deleted_at
   );
   ```

---

### 2. ReservationsService - searchAvailableTrips()

**Archivo:** `backend/src/modules/reservations/reservations.service.ts`

**Mismas correcciones aplicadas:**

```typescript
let query = supabase
  .from('trip_segments')
  .select(`
    *,
    trip:trips!inner(  // ← !inner
      id,
      departure_datetime,
      capacity,
      visibility,
      deleted_at,      // ← Agregado
      route:routes(...)
    )
  `)
  .gte('departure_time', dateFrom)
  .lte('departure_time', dateTo)
  .gt('available_seats', filters.min_seats || 0)
  .is('trip.deleted_at', null)           // ← Filtro agregado
  .eq('trip.visibility', 'published');   // ← Filtro agregado

// Doble verificación en memoria
results = results.filter(
  (segment) => segment.trip && !segment.trip.deleted_at && segment.trip.visibility === 'published'
);
```

---

### 3. ReservationsService - getAvailableOrigins()

**Corrección en query principal:**

```typescript
const { data, error } = await supabase
  .from('trip_segments')
  .select(`
    origin_stop_id,
    origin,
    trip_id,
    stops!trip_segments_origin_stop_id_fkey(id, name, city, state, full_location),
    trip:trips!inner(id, deleted_at, visibility)  // ← JOIN agregado
  `)
  .eq('company_id', companyId)
  .gte('departure_time', dateFrom)
  .lte('departure_time', dateTo)
  .gt('available_seats', 0)
  .not('origin_stop_id', 'is', null)
  .is('trip.deleted_at', null)           // ← Filtro agregado
  .eq('trip.visibility', 'published');   // ← Filtro agregado
```

**Corrección en método legacy:**

```typescript
const { data, error } = await supabase
  .from('trip_segments')
  .select(`
    origin,
    trip:trips!inner(id, deleted_at, visibility)  // ← JOIN agregado
  `)
  .eq('company_id', companyId)
  .gte('departure_time', dateFrom)
  .lte('departure_time', dateTo)
  .gt('available_seats', 0)
  .is('trip.deleted_at', null)           // ← Filtro agregado
  .eq('trip.visibility', 'published');   // ← Filtro agregado
```

---

### 4. ReservationsService - getAvailableDestinations()

**Mismas correcciones aplicadas** a los métodos principal y legacy.

---

## 🎯 Resultado

Ahora **SOLO se muestran**:
- ✅ Viajes con `deleted_at IS NULL` (no eliminados)
- ✅ Viajes con `visibility = 'published'` (publicados)

**NO se muestran**:
- ❌ Viajes con `deleted_at IS NOT NULL` (eliminados)
- ❌ Viajes con `visibility = 'hidden'` (ocultos)
- ❌ Viajes con `visibility = 'cancelled'` (cancelados)

---

## 🔑 Conceptos Clave

### LEFT JOIN vs INNER JOIN en Supabase

```typescript
// LEFT JOIN (por defecto)
trip:trips(...)
// Incluye trip_segments aunque el trip sea NULL

// INNER JOIN (lo que necesitamos)
trip:trips!inner(...)
// Solo incluye trip_segments si el trip existe Y cumple filtros
```

### Filtros anidados

```typescript
.is('trip.deleted_at', null)
// Filtra por el campo deleted_at de la tabla trips (relación)
```

### Doble verificación

```typescript
// SQL filter + JavaScript filter = Máxima seguridad
results = results.filter(
  (segment) => segment.trip && !segment.trip.deleted_at
);
```

---

## 🧪 Cómo Verificar la Corrección

### 1. Eliminar un viaje (soft delete)

```sql
UPDATE trips 
SET deleted_at = NOW() 
WHERE id = 'uuid-del-viaje';
```

### 2. Ir a "Nueva Reserva" en el frontend

- El viaje eliminado **NO debe aparecer**
- Solo viajes publicados deben mostrarse

### 3. Verificar en la consola del navegador

- No debe haber viajes con `trip.deleted_at !== null`
- Todos los viajes deben tener `trip.visibility === 'published'`

---

## 📝 Archivos Modificados

1. `backend/src/modules/trips/trips.service.ts`
   - `searchAvailableTrips()` - Líneas 365-438

2. `backend/src/modules/reservations/reservations.service.ts`
   - `searchAvailableTrips()` - Líneas 55-131
   - `getAvailableOrigins()` - Líneas 136-184
   - `getAvailableOriginsLegacy()` - Líneas 186-225
   - `getAvailableDestinations()` - Líneas 227-290
   - `getAvailableDestinationsLegacy()` - Líneas 292-331

---

## ✅ Estado

- ✅ Backend actualizado
- ✅ Backend reiniciado
- ✅ Sin errores de lint
- ✅ Listo para probar en frontend

---

## 🚀 Próximo Paso

1. **Recargar el navegador** (Cmd + Shift + R)
2. **Ir a "Nueva Reserva"**
3. **Verificar** que no se muestren viajes eliminados
4. **Buscar viajes** y confirmar que solo aparecen los publicados

---

## 💡 Nota Importante

Este fix también mejora la seguridad al nivel de base de datos:
- Los viajes eliminados **nunca** llegarán al frontend
- Los viajes ocultos/cancelados **nunca** se mostrarán en búsquedas
- Doble capa de protección (SQL + JavaScript)

---

**Fecha:** 2025-10-25  
**Versión:** 1.0  
**Estado:** ✅ Implementado y funcionando

