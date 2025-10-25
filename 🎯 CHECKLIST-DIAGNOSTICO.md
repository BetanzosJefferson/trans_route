# 🎯 CHECKLIST DE DIAGNÓSTICO

## ✅ CONFIRMADO POR TESTS

- [x] Backend funciona correctamente
- [x] Endpoint `/reservations/origins` devuelve solo "CONDESA"
- [x] Endpoint `/reservations/destinations` devuelve "Polvorin" y "Taxqueña"
- [x] Endpoint `/reservations/search` encuentra 1 viaje de $300
- [x] Normalización funciona ("Polvorín" = "Polvorin")

---

## 🔍 CHECKLIST PARA TI

### Paso 1: Limpiar Caché

- [ ] Abrir el navegador
- [ ] Presionar `Cmd + Shift + Delete` (Mac) o `Ctrl + Shift + Delete` (Windows)
- [ ] Seleccionar "Todo el tiempo"
- [ ] Marcar TODAS las opciones
- [ ] Clic en "Borrar datos"

**O ALTERNATIVA (más rápido):**

- [ ] Abrir ventana de incógnito: `Cmd + Shift + N` (Mac) o `Ctrl + Shift + N` (Windows)

---

### Paso 2: Abrir Consola del Navegador

- [ ] Ir a `http://localhost:3000`
- [ ] Presionar `F12` o `Cmd + Option + I`
- [ ] Ir a la pestaña "Console"
- [ ] Dejar la consola abierta

---

### Paso 3: Cargar Nueva Reserva

- [ ] Clic en "Nueva Reserva" en el menú
- [ ] Observar los logs en la consola

**¿Qué deberías ver?**

```
✅ Company ID establecido: d8d8448b-3689-4713-a56a-0183a1a7c70f
🔍 loadOrigins - Parámetros: ...
📦 loadOrigins - Respuesta del API: [...]
📊 loadOrigins - Cantidad de orígenes: 1
  1. CONDESA (Acapulco de Juarez, Guerrero|CONDESA)
✅ loadOrigins - Estado actualizado
🔄 Combobox [Origen]: { optionsCount: 1, options: ['CONDESA'], ... }
```

---

### Paso 4: Verificar Combobox de Origen

- [ ] Hacer clic en el combobox de "Origen"
- [ ] Verificar que **SOLO** muestre "CONDESA"

**SI VES MÁS OPCIONES:**
- ❌ "Centro", "Terminal", etc. → **PROBLEMA: Caché de React**
- ✅ Solo "CONDESA" → **CORRECTO**

---

### Paso 5: Seleccionar Origen

- [ ] Seleccionar "CONDESA"
- [ ] Observar los logs en la consola

**¿Qué deberías ver?**

```
🔍 loadDestinations - Parámetros: ...
📦 loadDestinations - Respuesta del API: [...]
📊 loadDestinations - Cantidad de destinos: 2
  1. Polvorin (Cuernavaca, Morelos|Polvorin)
  2. Taxqueña (Coyoacan, Ciudad de Mexico|Taxqueña)
```

---

### Paso 6: Verificar Combobox de Destino

- [ ] Hacer clic en el combobox de "Destino"
- [ ] Verificar que muestre "Polvorin" y "Taxqueña"

**SI VES OTRAS OPCIONES:**
- ❌ Opciones incorrectas → **PROBLEMA: Caché de React**
- ✅ Solo "Polvorin" y "Taxqueña" → **CORRECTO**

---

### Paso 7: Realizar Búsqueda

- [ ] Fecha: `2025-10-24` (o dejar la fecha actual)
- [ ] Origen: `CONDESA`
- [ ] Destino: `Polvorin`
- [ ] Clic en "Buscar"

**Resultado esperado:**

- [ ] Debe mostrar **1 tarjeta de viaje**
- [ ] Precio: **$300**
- [ ] Ruta: **Acapulco (CONDESA) → Cuernavaca (Polvorin)**
- [ ] Asientos disponibles: **15**

---

### Paso 8: Verificar Logs de Búsqueda

- [ ] Abrir la consola del navegador
- [ ] Ir a la pestaña "Network"
- [ ] Hacer la búsqueda
- [ ] Buscar la petición a `/reservations/search`
- [ ] Verificar los parámetros (Query Params)

**Parámetros esperados:**

```
company_id: d8d8448b-3689-4713-a56a-0183a1a7c70f
date_from: 2025-10-24
date_to: 2025-10-24
origin: Acapulco de Juarez, Guerrero|CONDESA
destination: Cuernavaca, Morelos|Polvorin
main_trips_only: false
```

---

## 🐛 PROBLEMAS Y SOLUCIONES

### Problema 1: El combobox muestra más de 1 origen

**Síntoma:**
```
❌ Combobox [Origen]: { options: ['Centro', 'CONDESA', 'Terminal', ...] }
```

**Causa:** Caché de React o múltiples llamadas al API

**Solución:**
1. Copia **TODOS** los logs de la consola
2. Envíamelos para analizar

---

### Problema 2: No encuentra viajes al buscar

**Síntoma:**
```
"No hay viajes con los filtros seleccionados"
```

**Causa:** Posibles:
- Parámetros incorrectos en la petición
- Estado desincronizado en React

**Solución:**
1. Ve a la pestaña "Network" de la consola
2. Busca la petición a `/reservations/search`
3. Copia los "Query Params"
4. Envíamelos para analizar

---

### Problema 3: El combobox no es clickeable

**Síntoma:**
- No puedo hacer clic en las opciones
- Las opciones aparecen deshabilitadas

**Causa:** Problema de z-index o eventos de mouse

**Solución:**
1. Verifica que `z-[9999]` esté en el PopoverContent
2. Verifica que `pointer-events-auto` esté en los CommandItem
3. Inspecciona el elemento con las DevTools del navegador

---

## 🧪 TESTS DE BACKEND

Si quieres verificar que el backend funciona:

### Test 1: Flujo completo
```bash
cd /Users/williambe/Documents/transroute/backend
node test-full-flow.js
```

**Resultado esperado:**
```
✅ Resultados encontrados: 1
   1. Acapulco de Juarez, Guerrero|CONDESA → Cuernavaca, Morelos|Polvorin
      Precio: $300
      Asientos: 15

🎉 BACKEND FUNCIONANDO CORRECTAMENTE
```

### Test 2: Frontend vs Backend
```bash
cd /Users/williambe/Documents/transroute/backend
node test-frontend-vs-backend.js
```

### Test 3: CLI Interactivo
```bash
cd /Users/williambe/Documents/transroute/backend
node cli-test.js
```

---

## 📝 INFORMACIÓN PARA ENVIARME

Si después de seguir todos los pasos el problema persiste, envíame:

### 1. Logs de la Consola (Console)

- [ ] Abre la pestaña "Console"
- [ ] Copia **TODOS** los logs desde que cargas la página
- [ ] Incluye los logs de color (🔍, 📦, ✅, ❌, etc.)

### 2. Peticiones de Red (Network)

- [ ] Abre la pestaña "Network"
- [ ] Busca `/reservations/origins`
- [ ] Copia la respuesta (Response)
- [ ] Busca `/reservations/destinations`
- [ ] Copia la respuesta (Response)
- [ ] Busca `/reservations/search`
- [ ] Copia los parámetros (Query Params) y la respuesta (Response)

### 3. Screenshots

- [ ] Screenshot del combobox de Origen con las opciones desplegadas
- [ ] Screenshot del combobox de Destino con las opciones desplegadas
- [ ] Screenshot de la pantalla después de hacer clic en "Buscar"

---

## ✅ SOLUCIÓN RÁPIDA

Si quieres hacer una prueba rápida sin depurar:

1. **Abre ventana de incógnito** (`Cmd + Shift + N`)
2. Ve a `http://localhost:3000`
3. Entra a "Nueva Reserva"
4. Selecciona:
   - Fecha: `2025-10-24`
   - Origen: `CONDESA`
   - Destino: `Polvorin`
5. Clic en "Buscar"

**Resultado:** Debe mostrar 1 viaje de $300

---

## 🎯 RESUMEN

| Componente | Estado |
|------------|--------|
| Backend | ✅ **100% Funcional** |
| Normalización | ✅ **Implementada** |
| Endpoint Origins | ✅ **OK** |
| Endpoint Destinations | ✅ **OK** |
| Endpoint Search | ✅ **OK** |
| Frontend | ⚠️ **Por verificar** |

---

## 💡 PRÓXIMO PASO

Sigue este checklist paso a paso y:

- ✅ **Si funciona:** ¡Perfecto! El problema era caché
- ❌ **Si no funciona:** Envíame los logs de la consola + screenshots

---

## 📚 DOCUMENTACIÓN RELACIONADA

- `✅ BACKEND-OK-FRONTEND-CACHE.md` - Explicación detallada
- `🔍 DIAGNOSTICO-FRONTEND.md` - Pasos de diagnóstico
- `✅ SOLUCION-NORMALIZACION-IMPLEMENTADA.md` - Cómo funciona la normalización

