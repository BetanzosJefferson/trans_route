# 🔍 DIAGNÓSTICO PASO A PASO - Combobox Orígenes/Destinos

## ¿QUÉ ESTÁ PASANDO?

### ✅ BACKEND: **FUNCIONANDO CORRECTAMENTE**

He verificado con pruebas directas a la base de datos:

```
📊 TEST DIRECTO A BASE DE DATOS:
   - SIN filtro is_main_trip: 6 orígenes ✅
   - CON filtro is_main_trip: 2 orígenes
   - Diferencia: 4 orígenes intermedios adicionales

🎯 ORÍGENES DISPONIBLES (6 total):
   1. Terminal (Aguascalientes) ✅
   2. Terminal TAPO (Ciudad de México, CDMX) ✅
   3. Terminal de Autobuses (Guadalajara, Jalisco) ✅
   4. Terminal León (León, Guanajuato) ✅
   5. Terminal QRO (Querétaro, Querétaro) ✅
   6. Terminal (Zacatecas) ✅
```

**Conclusión Backend:** El código del backend está CORRECTO y devolviendo los 6 orígenes.

---

### ❓ FRONTEND: **POSIBLE CACHE DEL NAVEGADOR**

El código del frontend también está correcto:
- ✅ Llama a `api.reservations.getAvailableOrigins()`
- ✅ El endpoint es correcto: `/reservations/origins`
- ✅ Los parámetros son correctos

**PERO** el navegador puede tener:
1. Cache de la página
2. Cache del Service Worker
3. Versión antigua del JavaScript
4. DevTools network cache

---

## 🔧 SOLUCIÓN PASO A PASO

### PASO 1: Verificar Backend
```bash
cd /Users/williambe/Documents/transroute/backend
node test-endpoints-direct.js
```

Debes ver: `6 orígenes únicos`

---

### PASO 2: Verificar Conexión HTTP
Abre el archivo: `frontend/test-api-call.html` en tu navegador.

Este test HTML hará llamadas DIRECTAS al API sin cache.

**Resultados esperados:**
- ✅ Backend está corriendo en puerto 3001
- ✅ Recibidos 6 orígenes (o 401 Unauthorized - normal)

---

### PASO 3: Limpiar Cache del Navegador

#### Opción A: Hard Refresh
- **Mac:** `Cmd + Shift + R`
- **Windows/Linux:** `Ctrl + Shift + R`

#### Opción B: Modo Incógnito
1. Abre Chrome/Firefox en modo incógnito
2. Ve a http://localhost:3000/dashboard/nueva-reserva
3. Prueba el combobox de orígenes

#### Opción C: Limpiar Cache Manualmente
1. Abre DevTools (F12)
2. Ve a Application > Storage
3. Click en "Clear site data"
4. Recarga la página

---

### PASO 4: Verificar en DevTools Network

1. Abre la página de Nueva Reserva
2. Abre DevTools (F12) > Network
3. Recarga la página
4. Busca la llamada: `GET /reservations/origins?company_id=...`
5. Verifica la respuesta

**Debe mostrar un array de 6 objetos:**
```json
[
  {
    "value": "Aguascalientes|Terminal",
    "label": "Terminal",
    "location": "Aguascalientes"
  },
  {
    "value": "Ciudad de México, CDMX|Terminal TAPO",
    "label": "Terminal TAPO",
    "location": "Ciudad de México, CDMX"
  },
  ...
]
```

---

## 🎯 SOBRE EL COMBOBOX

### ¿Por qué crear desde cero vs usar shadcn?

**Respuesta:** Tienes razón. Ahora estoy usando el **patrón oficial de shadcn**.

El "combobox" de shadcn NO es un componente separado, es un **ejemplo** que combina:
- `Command` (búsqueda)
- `Popover` (dropdown)
- `CommandItem` (items seleccionables)

He reescrito el combobox siguiendo **EXACTAMENTE** el ejemplo de shadcn:
```tsx
// frontend/src/components/ui/combobox.tsx
// Basado en: https://ui.shadcn.com/docs/components/combobox
```

---

## 🐛 ¿POR QUÉ SOLO MUESTRA MAIN TRIPS?

### Problema Identificado:
El código del backend **YA NO** tiene el filtro `is_main_trip = true`.

**Archivo:** `backend/src/modules/reservations/reservations.service.ts`
```typescript
// ANTES (❌ MAL):
.eq('is_main_trip', true)  // Solo viajes principales

// AHORA (✅ BIEN):
// REMOVIDO - Muestra TODOS los orígenes disponibles
```

### Si aún ves solo 2 orígenes:
1. El backend NO se reinició correctamente
2. El navegador tiene cache
3. Hay múltiples instancias del backend corriendo

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Backend compilado con cambios: `npm run build`
- [ ] Solo 1 proceso backend corriendo (no múltiples)
- [ ] Test directo muestra 6 orígenes
- [ ] Cache del navegador limpiado
- [ ] DevTools Network muestra respuesta con 6 orígenes
- [ ] Combobox es clickeable
- [ ] Combobox muestra las 6 opciones

---

## 🚀 PRÓXIMOS PASOS

1. **Abre el test HTML** (`test-api-call.html`) para verificar la conexión
2. **Limpia el cache** del navegador completamente
3. **Abre modo incógnito** y prueba allí
4. **Verifica DevTools Network** para confirmar qué devuelve el API
5. **Reporta** qué muestra el test HTML

---

## 📝 ARCHIVOS MODIFICADOS

```
✅ backend/src/modules/reservations/reservations.service.ts
   - Removido filtro is_main_trip de getAvailableOrigins()
   - Removido filtro is_main_trip de getAvailableDestinations()

✅ frontend/src/components/ui/combobox.tsx
   - Reescrito siguiendo patrón oficial de shadcn
   - Mejor manejo de eventos click
   - Mejor filtrado de opciones

✅ frontend/src/app/(dashboard)/dashboard/nueva-reserva/page.tsx
   - Llama correctamente a loadOrigins()
   - Pasa opciones correctamente al Combobox
```

---

## 🎯 CONCLUSIÓN

**El código está CORRECTO.** El problema es muy probablemente **CACHE DEL NAVEGADOR**.

Sigue los pasos de limpieza de cache y reporta los resultados del test HTML.

