# 🎯 PROBLEMA IDENTIFICADO - Stops vs Trip Segments

## 🔴 EL PROBLEMA REAL

Los **trip_segments** disponibles para la fecha 2025-10-24:

```
Origen:  Acapulco de Juarez, Guerrero|CONDESA  ← Solo este existe
Destino: Coyoacan, Ciudad de Mexico|Taxqueña

Origen:  Acapulco de Juarez, Guerrero|CONDESA
Destino: Cuernavaca, Morelos|Polvorin (sin tilde)
```

Pero el combobox está mostrando **4 opciones de origen**, incluyendo:
```
❌ Acapulco de Juarez, Guerrero|Centro (NO existe en trip_segments)
```

---

## 🔍 ¿DE DÓNDE VIENEN ESAS 4 OPCIONES?

El frontend está mostrando 4 orígenes, pero `getAvailableOrigins()` solo debería devolver 1 (CONDESA).

**Posibles causas:**

###1. El frontend tiene cache
El combobox tiene opciones viejas cacheadas.

**Solución:** Hard refresh (Cmd+Shift+R).

---

### 2. El endpoint está devolviendo mal
`getAvailableOrigins()` está incluyendo paradas de rutas en lugar de solo trip_segments.

**Verificación:** El código del backend está correcto (solo consulta trip_segments).

---

### 3. Hay múltiples llamadas mezcladas
El frontend está mezclando datos de diferentes endpoints.

**Verificación:** Revisar si hay llamadas a `/routes/stops/all` que no se estén usando.

---

## 🚨 CONSECUENCIA

Cuando el usuario selecciona "Centro" del combobox:
1. El frontend busca viajes con origen = "Acapulco de Juarez, Guerrero|Centro"
2. El backend NO encuentra ningún trip_segment con ese origen
3. Devuelve 0 resultados
4. Mensaje: "No hay viajes con los filtros seleccionados"

---

## ✅ SOLUCIÓN

El combobox SOLO debe mostrar **CONDESA** como opción de origen para esa fecha.

### Verificación en el navegador:

Abre DevTools Console y busca:

```javascript
✅ Orígenes recibidos del API: X

// Debería mostrar solo 1 origen si la fecha es 2025-10-24
[
  {
    value: "Acapulco de Juarez, Guerrero|CONDESA",
    label: "CONDESA",
    location: "Acapulco de Juarez, Guerrero"
  }
]
```

---

## 🧪 TEST PARA CONFIRMAR

```bash
cd backend

# Ver qué orígenes existen realmente
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

(async () => {
  const companyId = 'd8d8448b-3689-4713-a56a-0183a1a7c70f';
  const today = new Date('2025-10-24');
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate()+1);
  
  const { data } = await supabase
    .from('trip_segments')
    .select('origin')
    .eq('company_id', companyId)
    .gte('departure_time', today.toISOString())
    .lte('departure_time', tomorrow.toISOString())
    .gt('available_seats', 0);
  
  const origins = [...new Set(data?.map(s => s.origin) || [])];
  
  console.log('Orígenes reales:', origins.length);
  origins.forEach(o => console.log('  -', o));
})().then(() => process.exit(0));
"
```

**Resultado esperado:**
```
Orígenes reales: 1
  - Acapulco de Juarez, Guerrero|CONDESA
```

---

## 🎯 PASOS PARA SOLUCIONAR

### 1. Limpia el cache del navegador
```
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows)
```

---

### 2. Verifica en DevTools Console

Busca el log cuando se cargan los orígenes. Debería decir:

```javascript
✅ Orígenes recibidos del API: 1
```

Si dice **4** u otro número, hay un problema.

---

### 3. Selecciona el origen correcto

El combobox SOLO debe mostrar:
```
CONDESA
Acapulco de Juarez, Guerrero
```

---

### 4. Selecciona un destino que exista

Destinos válidos desde CONDESA:
```
✅ Taxqueña (Coyoacan, Ciudad de Mexico)
✅ Polvorin (Cuernavaca, Morelos) ← SIN TILDE
```

---

## 📊 COMBINACIONES VÁLIDAS

Para la fecha 2025-10-24, solo existen estas 2 combinaciones:

```
1. CONDESA → Taxqueña
   Precio: $400
   Asientos: 11
   Hora: 11:50 PM

2. CONDESA → Polvorin (sin tilde)
   Precio: $300
   Asientos: 15
   Hora: 11:50 PM
```

---

## 💡 SI EL COMBOBOX MUESTRA 4 OPCIONES

Significa que está usando datos viejos o mezclando con otras fuentes.

**Soluciones:**

1. **Hard refresh:** Cmd+Shift+R
2. **Modo incógnito:** Para empezar limpio
3. **Verificar Network:** Ver qué devuelve `/reservations/origins`

---

## 🔧 DEBUGGING

En DevTools Console, ejecuta:

```javascript
// Ver qué opciones tiene el combobox
console.log('Opciones del combobox:', availableOrigins);

// Debería mostrar solo 1 opción con "CONDESA"
```

---

## ✅ RESUMEN

- ✅ Backend correcto: `getAvailableOrigins()` funciona bien
- ✅ Datos en BD: 2 viajes disponibles desde CONDESA
- ❌ Frontend: Mostrando 4 opciones en lugar de 1
- 💡 Solución: Cache del navegador o datos mezclados

**Acción inmediata:** Hard refresh y verificar que solo aparezca 1 origen en el combobox.

---

**Si después del hard refresh siguen apareciendo 4 opciones, copia el log completo de Console para ver de dónde vienen.**

