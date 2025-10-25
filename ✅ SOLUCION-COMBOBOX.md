# ✅ SOLUCIÓN IMPLEMENTADA - Combobox Orígenes/Destinos

## 🔧 CAMBIOS REALIZADOS

### 1. **Combobox - Fix del problema de lowercase** ✅

**Archivo:** `frontend/src/components/ui/combobox.tsx`

**Problema identificado:**
El componente `Command` de `cmdk` convierte automáticamente los valores a lowercase para el filtrado interno. Cuando hacías click en un item con valor `"Ciudad de México, CDMX|Terminal TAPO"`, el callback `onSelect` recibía `"ciudad de méxico, cdmx|terminal tapo"` (lowercase), causando que la selección fallara.

**Solución aplicada:**
- ✅ Agregado `shouldFilter={false}` al componente Command
- ✅ Implementado filtrado manual con `React.useMemo` que preserva valores originales
- ✅ Estado `search` para controlar el input de búsqueda
- ✅ Modificado `onSelect` para usar directamente `option.value` en lugar de `currentValue`
- ✅ Agregado `type="button"` al trigger para evitar submit accidental
- ✅ Limpieza del search al cerrar el popover

```tsx
// Filtrado manual
const filteredOptions = React.useMemo(() => {
  if (!search) return options
  const searchLower = search.toLowerCase()
  return options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchLower) ||
      opt.location?.toLowerCase().includes(searchLower) ||
      opt.value.toLowerCase().includes(searchLower)
  )
}, [options, search])

// Command sin filtrado automático
<Command shouldFilter={false}>
  <CommandInput 
    placeholder="Buscar..." 
    value={search}
    onValueChange={setSearch}
  />
  {/* ... */}
</Command>

// onSelect arreglado
onSelect={() => {
  onChange(option.value === value ? "" : option.value)
  setOpen(false)
  setSearch("")
}}
```

---

### 2. **Frontend - Logging de debugging** ✅

**Archivo:** `frontend/src/app/(dashboard)/dashboard/nueva-reserva/page.tsx`

**Cambios:**
- ✅ Agregados console.logs en `loadOrigins()` para ver cuántos orígenes devuelve el API
- ✅ Agregados console.logs en `loadDestinations()` para ver cuántos destinos devuelve
- ✅ Agregados console.logs antes del render de cada Combobox para ver cuántas opciones recibe

```tsx
const loadOrigins = async (company: string, selectedDate: string) => {
  try {
    console.log('🔍 Cargando orígenes para fecha:', selectedDate)
    console.log('📅 Rango:', startOfDay.toISOString(), 'a', endOfDay.toISOString())
    
    const origins = await api.reservations.getAvailableOrigins(...)
    
    console.log('✅ Orígenes recibidos del API:', origins?.length || 0)
    console.log('📊 Datos completos:', origins)
    
    setAvailableOrigins(origins || [])
  } catch (error) {
    console.error('❌ Error loading origins:', error)
    setAvailableOrigins([])
  }
}
```

---

### 3. **Backend - Verificación del código compilado** ✅

**Archivo verificado:** `backend/dist/modules/reservations/reservations.service.js`

**Resultado:**
✅ **CONFIRMADO:** Los métodos `getAvailableOrigins` y `getAvailableDestinations` **NO tienen** el filtro `.eq('is_main_trip', true)`

**Código compilado de `getAvailableOrigins` (líneas 98-118):**
```javascript
async getAvailableOrigins(companyId, dateFrom, dateTo) {
    const supabase = this.supabaseService.getServiceClient();
    const { data, error } = await supabase
        .from('trip_segments')
        .select('origin')
        .eq('company_id', companyId)
        // ✅ NO HAY .eq('is_main_trip', true)
        .gte('departure_time', dateFrom)
        .lte('departure_time', dateTo)
        .gt('available_seats', 0);
    // ... resto del código
}
```

**Código compilado de `getAvailableDestinations` (líneas 120-145):**
```javascript
async getAvailableDestinations(companyId, origin, dateFrom, dateTo) {
    const supabase = this.supabaseService.getServiceClient();
    let query = supabase
        .from('trip_segments')
        .select('destination')
        .eq('company_id', companyId)
        // ✅ NO HAY .eq('is_main_trip', true)
        .gte('departure_time', dateFrom)
        .lte('departure_time', dateTo)
        .gt('available_seats', 0);
    // ... resto del código
}
```

---

## 🎯 PRÓXIMOS PASOS PARA PROBAR

### **PASO 1: Limpiar Cache del Navegador**

Es **CRÍTICO** que limpies el cache antes de probar:

#### **Opción A: Hard Refresh (Recomendado)**
- **Mac:** `Cmd + Shift + R`
- **Windows/Linux:** `Ctrl + Shift + R`

#### **Opción B: Modo Incógnito (Más seguro)**
1. Abre Chrome/Firefox en modo incógnito
2. Ve a: `http://localhost:3000/dashboard/nueva-reserva`
3. Prueba el combobox

#### **Opción C: Limpiar Cache Manualmente**
1. Abre DevTools (F12)
2. Application > Storage
3. "Clear site data"
4. Recarga la página

---

### **PASO 2: Verificar en DevTools Console**

1. Abre la página de Nueva Reserva
2. Abre DevTools (F12) > **Console**
3. Deberías ver estos logs:

```
🔍 Cargando orígenes para fecha: 2025-10-24
📅 Rango: 2025-10-24T00:00:00.000Z a 2025-10-24T23:59:59.999Z
✅ Orígenes recibidos del API: 6
📊 Datos completos: [{...}, {...}, ...]
🎨 Renderizando Combobox de ORIGEN con 6 opciones
```

---

### **PASO 3: Verificar en DevTools Network**

1. DevTools (F12) > **Network**
2. Recarga la página
3. Busca la llamada: `GET /reservations/origins?company_id=...`
4. Click en la llamada > **Response**

**Debes ver un array con 6 objetos:**
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
  {
    "value": "Guadalajara, Jalisco|Terminal de Autobuses",
    "label": "Terminal de Autobuses",
    "location": "Guadalajara, Jalisco"
  },
  {
    "value": "León, Guanajuato|Terminal León",
    "label": "Terminal León",
    "location": "León, Guanajuato"
  },
  {
    "value": "Querétaro, Querétaro|Terminal QRO",
    "label": "Terminal QRO",
    "location": "Querétaro, Querétaro"
  },
  {
    "value": "Zacatecas|Terminal",
    "label": "Terminal",
    "location": "Zacatecas"
  }
]
```

---

### **PASO 4: Probar el Combobox**

1. Click en el combobox de **Origen**
2. Verifica que:
   - ✅ Se abre el dropdown
   - ✅ Muestra las 6 opciones
   - ✅ Puedes escribir para buscar
   - ✅ **AL HACER CLICK, SE SELECCIONA** (ESTO ES LO CRÍTICO)
   - ✅ El dropdown se cierra
   - ✅ El valor seleccionado aparece en el botón

3. Selecciona un origen
4. El combobox de **Destino** debería cargar los destinos disponibles desde ese origen

---

## 🐛 SI AÚN NO FUNCIONA

### Si el combobox sigue sin ser clickeable:
1. Verifica que NO hay errores en Console
2. Verifica que el código de `combobox.tsx` tiene `shouldFilter={false}`
3. Verifica que el frontend se recompiló correctamente

### Si solo muestra 2 orígenes en lugar de 6:
1. Verifica en Network > Response que el API devuelve 6 orígenes
2. Si Network muestra 6 pero Console solo muestra 2, hay un problema de cache
3. Usa modo incógnito como prueba definitiva

### Si Network muestra 401 Unauthorized:
- Esto es **normal** para endpoints protegidos
- Los datos aún existen en el backend
- El problema sería de autenticación, no de los orígenes

---

## 📊 QÚSÉ ESPERAR

### **ANTES (❌ Problema):**
- Solo 2 orígenes: "Terminal TAPO" y "Terminal de Autobuses" (main trips)
- Combobox no clickeable
- `onSelect` recibía valores en lowercase que no coincidían

### **AHORA (✅ Solución):**
- 6 orígenes: todos los orígenes disponibles (main trips + intermedios)
- Combobox clickeable y funcional
- `onSelect` usa el valor original sin modificar
- Filtrado manual que preserva los valores

---

## 🚀 INSTRUCCIONES RÁPIDAS

```bash
# 1. El backend ya está corriendo (puerto 3001)
# 2. El frontend debe estar corriendo (puerto 3000)

# Si el frontend NO está corriendo:
cd frontend
npm run dev

# 3. Abre en modo incógnito:
#    http://localhost:3000/dashboard/nueva-reserva

# 4. Abre DevTools (F12) > Console

# 5. Prueba el combobox de Origen
```

---

## 📝 REPORTAR RESULTADOS

Necesito que me confirmes:

1. ¿Cuántos orígenes ves en Console? (debe ser 6)
2. ¿El combobox es clickeable? (debe ser SÍ)
3. ¿Puedes seleccionar un origen? (debe ser SÍ)
4. ¿Network muestra 6 orígenes en Response? (debe ser SÍ)

Con esta información podré confirmar si la solución funcionó o si necesitamos investigar más.

