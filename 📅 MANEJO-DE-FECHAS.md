# 📅 Estrategia Global de Manejo de Fechas

## 🎯 Objetivo

Evitar problemas de timezone en todo el sistema TransRoute implementando una estrategia centralizada y consistente.

---

## 🌍 Zona Horaria del Sistema

**Zona horaria:** `America/Mexico_City` (Hora Central de México)
- **Hora estándar:** UTC-6 (CST)
- **Horario de verano:** UTC-5 (CDT)

---

## 📦 Herramienta Principal

**Librería:** `date-fns-tz` + `date-fns`

```bash
npm install date-fns date-fns-tz
```

---

## 📁 Archivo de Utilidades

**Ubicación:** `/frontend/src/lib/date-utils.ts`

Este archivo contiene **TODAS** las funciones para manejar fechas y horas en el sistema.

---

## 🔄 Flujo de Datos

### Al GUARDAR datos (Frontend → Backend)

```
Usuario ingresa hora local → localToUTC() → Backend guarda en UTC
```

**Ejemplo:**
```typescript
import { localToUTC } from '@/lib/date-utils'

// Usuario ingresa: 14:00 (2:00 PM)
const utcDateTime = localToUTC('2025-10-24', '14:00')
// Resultado: "2025-10-24T20:00:00.000Z" (UTC)

await api.trips.create({
  departure_datetime: utcDateTime, // Se guarda en UTC
  // ...
})
```

### Al MOSTRAR datos (Backend → Frontend)

```
Backend devuelve UTC → formatLocalTime() → Usuario ve hora local
```

**Ejemplo:**
```typescript
import { formatLocalTime } from '@/lib/date-utils'

// Backend devuelve: "2025-10-24T20:00:00Z" (UTC)
const displayTime = formatLocalTime(trip.departure_datetime)
// Resultado: "14:00" (hora local de México)
```

---

## 📚 Funciones Disponibles

### 1️⃣ Formateo (UTC → Local)

#### `formatLocalTime(date)`
Muestra solo la hora en formato 24h
```typescript
formatLocalTime('2025-10-24T20:00:00Z')
// → "14:00"
```

#### `formatLocalTime12h(date)`
Muestra solo la hora en formato 12h
```typescript
formatLocalTime12h('2025-10-24T20:00:00Z')
// → "2:00 PM"
```

#### `formatLocalDate(date)`
Muestra solo la fecha
```typescript
formatLocalDate('2025-10-24T20:00:00Z')
// → "24/10/2025"
```

#### `formatLocalDateTime(date, format)`
Formato personalizado
```typescript
formatLocalDateTime('2025-10-24T20:00:00Z', 'dd/MM/yyyy HH:mm')
// → "24/10/2025 14:00"
```

#### `formatLocalDateFull(date)`
Fecha con nombre del día
```typescript
formatLocalDateFull('2025-10-24T20:00:00Z')
// → "viernes, 24 de octubre de 2025"
```

---

### 2️⃣ Conversión (Local → UTC)

#### `localToUTC(dateStr, timeStr)`
**⚠️ Función más importante para GUARDAR**
```typescript
localToUTC('2025-10-24', '14:00')
// → "2025-10-24T20:00:00.000Z"
```

---

### 3️⃣ Utilidades

#### `getTodayLocalDateString()`
Fecha actual para inputs `type="date"`
```typescript
<Input
  type="date"
  min={getTodayLocalDateString()}
/>
```

#### `getCurrentLocalTimeString()`
Hora actual para inputs `type="time"`
```typescript
<Input
  type="time"
  value={getCurrentLocalTimeString()}
/>
```

#### `getMinutesDifference(start, end)`
Diferencia en minutos entre dos fechas
```typescript
const minutes = getMinutesDifference(
  '2025-10-24T20:00:00Z',
  '2025-10-24T22:30:00Z'
)
// → 150
```

#### `formatDuration(minutes)`
Convierte minutos a formato legible
```typescript
formatDuration(150)
// → "2h 30min"
```

#### `isToday(date)`, `isPast(date)`, `isFuture(date)`
Verificación de fechas
```typescript
isToday('2025-10-24T20:00:00Z') // → true/false
```

---

## 🎨 Ejemplos de Uso Real

### Ejemplo 1: Formulario de Publicación de Viaje

```typescript
import { localToUTC, getTodayLocalDateString } from '@/lib/date-utils'

function PublishTripForm() {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('08:00')

  const handleSubmit = async () => {
    // Convertir a UTC antes de enviar
    const departureDateTime = localToUTC(date, time)
    
    await api.trips.create({
      departure_datetime: departureDateTime,
      // ...
    })
  }

  return (
    <>
      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        min={getTodayLocalDateString()} // ✅ Fecha mínima en hora local
      />
      <Input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
    </>
  )
}
```

### Ejemplo 2: Listado de Viajes

```typescript
import { formatLocalTime, formatLocalDate } from '@/lib/date-utils'

function TripsList({ trips }) {
  return (
    <>
      {trips.map(trip => (
        <div key={trip.id}>
          <p>Fecha: {formatLocalDate(trip.departure_datetime)}</p>
          <p>Hora: {formatLocalTime(trip.departure_datetime)}</p>
          {/* ✅ Siempre muestra en hora local de México */}
        </div>
      ))}
    </>
  )
}
```

### Ejemplo 3: Cálculo de Duración

```typescript
import { getMinutesDifference, formatDuration } from '@/lib/date-utils'

function TripDuration({ trip }) {
  const minutes = getMinutesDifference(
    trip.departure_datetime,
    trip.arrival_datetime
  )
  
  return <span>Duración: {formatDuration(minutes)}</span>
  // → "Duración: 3h 45min"
}
```

---

## ✅ Reglas de Oro

### ✅ DO (Hacer)

1. **SIEMPRE** usar `localToUTC()` al guardar fechas/horas
2. **SIEMPRE** usar `formatLocalTime()`, `formatLocalDate()`, etc. al mostrar
3. **SIEMPRE** usar `getTodayLocalDateString()` para date inputs
4. **SIEMPRE** importar funciones desde `@/lib/date-utils`

### ❌ DON'T (No hacer)

1. ❌ **NUNCA** usar `new Date().toISOString()` directamente
2. ❌ **NUNCA** usar `format()` de `date-fns` sin timezone
3. ❌ **NUNCA** crear strings de fecha manualmente (ej: `${date}T${time}:00`)
4. ❌ **NUNCA** usar `toLocaleString()` sin especificar timezone

---

## 🔍 ¿Por Qué Esta Estrategia?

### Problema Clásico

```typescript
// ❌ MAL - Causa problemas de timezone
const datetime = `${date}T${time}:00`
// Usuario ingresa 14:00, pero se guarda 20:00 UTC
// Al mostrar, muestra 20:00 en lugar de 14:00
```

### Solución Correcta

```typescript
// ✅ BIEN - Manejo explícito de timezone
const datetime = localToUTC(date, time)
// Usuario ingresa 14:00 CST
// Se guarda 20:00 UTC (correcto)
// Al mostrar, se convierte de vuelta a 14:00 CST
```

---

## 🎯 Áreas del Sistema que Usan Fechas

| Área | Uso de Fechas |
|------|---------------|
| **Viajes** | ✅ Implementado |
| **Reservaciones** | 🔜 Pendiente |
| **Paquetes** | 🔜 Pendiente |
| **Cortes de Caja** | 🔜 Pendiente |
| **Reportes** | 🔜 Pendiente |
| **Auditoría** | 🔜 Pendiente |

---

## 📝 Checklist para Nuevas Features

Cuando implementes una feature que use fechas/horas:

- [ ] Importar funciones desde `@/lib/date-utils`
- [ ] Usar `localToUTC()` al guardar
- [ ] Usar `formatLocal*()` al mostrar
- [ ] Usar `getTodayLocalDateString()` para inputs de fecha
- [ ] NO usar `new Date().toISOString()` directamente
- [ ] NO usar `format()` sin timezone
- [ ] Probar con diferentes horas (AM/PM, medianoche, etc.)

---

## 🧪 Casos de Prueba

### Test 1: Viaje a las 2:00 PM
```
Input: 14:00 (2:00 PM)
Guardado: 20:00 UTC
Mostrado: 14:00 (2:00 PM) ✅
```

### Test 2: Viaje a medianoche
```
Input: 00:00 (12:00 AM)
Guardado: 06:00 UTC
Mostrado: 00:00 (12:00 AM) ✅
```

### Test 3: Viaje nocturno
```
Input: 23:50 (11:50 PM)
Guardado: 05:50 UTC (día siguiente)
Mostrado: 23:50 (11:50 PM) ✅
```

---

## 🚀 Próximos Pasos

1. ✅ **Viajes:** Implementado
2. 🔜 **Reservaciones:** Aplicar misma estrategia
3. 🔜 **Paquetes:** Aplicar misma estrategia
4. 🔜 **Cortes:** Aplicar misma estrategia
5. 🔜 **Reportes:** Filtros con fechas locales

---

## 💡 Nota Final

**Esta estrategia es CRÍTICA para el éxito del sistema.**

Seguir estas reglas garantiza que:
- ✅ Las horas se muestran correctamente
- ✅ No hay confusión con timezones
- ✅ Los reportes son precisos
- ✅ El sistema es mantenible
- ✅ Los usuarios confían en los datos

---

**Fecha de implementación:** 24 de octubre, 2025  
**Sistema:** TransRoute v1.0  
**Archivo de utilidades:** `/frontend/src/lib/date-utils.ts`

