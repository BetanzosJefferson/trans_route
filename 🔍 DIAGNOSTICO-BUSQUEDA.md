# 🔍 DIAGNÓSTICO - Búsqueda de Viajes

## 🎯 PROBLEMA

Al buscar viajes con origen y destino seleccionados, aparece el mensaje:
> "No hay viajes con los filtros seleccionados"

Pero sabemos que **SÍ hay viajes en la base de datos**.

---

## ✅ VERIFICACIÓN DEL BACKEND

He ejecutado el test `test-search-trips.js` y confirmé que:

```
✅ Total segments disponibles: 24
✅ Orígenes únicos: 6
✅ Destinos únicos: 6
✅ Formato correcto: Sí
✅ Búsqueda de prueba exitosa: 2 viajes encontrados
```

**Ejemplo de búsqueda exitosa:**
- Origen: `Guadalajara, Jalisco|Terminal de Autobuses`
- Destino: `Monterrey, Nuevo León|Central de Autobuses`
- Resultado: 2 viajes (8:00 AM y 2:00 PM)

**Conclusión:** El backend funciona perfectamente.

---

## 🕵️ DIAGNÓSTICO EN EL FRONTEND

He agregado logging detallado en el frontend. Ahora necesitas:

### **PASO 1: Abrir DevTools Console**

1. Abre la página de Nueva Reserva
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**

---

### **PASO 2: Hacer una Búsqueda**

1. Selecciona un **origen** del combobox
2. Selecciona un **destino** del combobox  
3. Click en **Buscar**

---

### **PASO 3: Verificar los Logs**

Deberías ver algo como esto:

```javascript
🔍 Búsqueda de viajes con filtros: {
  company_id: "...",
  main_trips_only: false,
  origin: "Guadalajara, Jalisco|Terminal de Autobuses",
  destination: "Monterrey, Nuevo León|Central de Autobuses",
  date_from: "2025-10-24T06:00:00.000Z",
  date_to: "2025-10-25T06:00:00.000Z"
}

📊 Respuesta del API: {
  total: 2,
  viajes: [...]
}
```

---

## 🐛 POSIBLES PROBLEMAS Y SOLUCIONES

### ❌ PROBLEMA 1: `origin` o `destination` son `undefined`

**Síntoma en Console:**
```javascript
🔍 Búsqueda de viajes con filtros: {
  origin: undefined,  // ❌
  destination: undefined,  // ❌
  main_trips_only: true
}
```

**Causa:** El combobox no está actualizando el estado correctamente.

**Solución:** Ya arreglamos esto con el z-index, pero verifica que la selección funcione.

---

### ❌ PROBLEMA 2: Los valores no coinciden con la BD

**Síntoma en Console:**
```javascript
origin: "Guadalajara"  // ❌ Formato incorrecto (sin pipe)
// Debería ser:
origin: "Guadalajara, Jalisco|Terminal de Autobuses"  // ✅
```

**Causa:** El combobox está enviando solo el `label` en lugar del `value`.

**Solución:** Verificar que el `onChange` del combobox use `option.value`.

---

### ❌ PROBLEMA 3: `main_trips_only` es `true` cuando debería ser `false`

**Síntoma en Console:**
```javascript
origin: "Guadalajara, Jalisco|Terminal de Autobuses",
destination: "Monterrey, Nuevo León|Central de Autobuses",
main_trips_only: true  // ❌ Debería ser false
```

**Causa:** La lógica del filtro está invertida.

**Solución actual en el código:**
```typescript
main_trips_only: !origin && !destination
```

Esto está **CORRECTO**: si hay origen O destino, `main_trips_only` será `false`.

---

### ❌ PROBLEMA 4: La respuesta tiene 0 viajes

**Síntoma en Console:**
```javascript
📊 Respuesta del API: {
  total: 0,  // ❌
  viajes: []
}
```

**Causa:** El backend no encuentra viajes con esos parámetros.

**Pasos de verificación:**

1. **Copiar los valores exactos** de `origin` y `destination` del log
2. **Abrir DevTools > Network**
3. **Buscar** la llamada `GET /reservations/search`
4. **Verificar** el Query String en la URL

La URL debería verse así:
```
/reservations/search?company_id=xxx&origin=Guadalajara%2C%20Jalisco%7CTerminal%20de%20Autobuses&destination=...
```

---

## 🧪 TEST MANUAL EN EL BACKEND

Puedes probar manualmente con valores del frontend:

```bash
cd backend
node test-search-trips.js
```

Este test te mostrará:
- ✅ Qué combinaciones de origen-destino existen
- ✅ Cuántos viajes hay para cada combinación
- ✅ El formato exacto de los valores en la BD

---

## 🔧 SOLUCIONES SEGÚN EL LOG

### Si ves: `origin: undefined, destination: undefined`

**Solución:**
```typescript
// Verificar que el onChange del Combobox esté bien
<Combobox
  value={origin}
  onChange={(newValue) => {
    console.log('Origen seleccionado:', newValue);  // Debug
    setOrigin(newValue);
  }}
/>
```

---

### Si ves: `total: 0` pero los valores se ven correctos

**Solución:** Verificar en Network > Response si el backend devuelve datos.

**Si el backend SÍ devuelve datos pero el frontend dice 0:**
```typescript
// Verificar que la respuesta se esté procesando bien
const data = await api.reservations.searchAvailableTrips(filters)
console.log('Tipo de data:', typeof data, Array.isArray(data))
```

---

### Si ves error 401 Unauthorized

**Problema:** El endpoint requiere autenticación.

**Verificar:** Si estás logueado en la aplicación.

---

## 📊 COMPARACIÓN: Backend vs Frontend

### Backend (test-search-trips.js):
```
Origen: Guadalajara, Jalisco|Terminal de Autobuses
Destino: Monterrey, Nuevo León|Central de Autobuses
Resultado: ✅ 2 viajes
```

### Frontend (debe coincidir):
```javascript
{
  origin: "Guadalajara, Jalisco|Terminal de Autobuses",
  destination: "Monterrey, Nuevo León|Central de Autobuses",
  company_id: "...",
  date_from: "...",
  date_to: "..."
}
```

**Si estos valores coinciden, DEBE funcionar.**

---

## 🚀 PRÓXIMOS PASOS

1. **Abre el navegador** en modo incógnito
2. **Ve a Nueva Reserva**
3. **Abre DevTools > Console**
4. **Selecciona origen y destino**
5. **Click en Buscar**
6. **Copia y pega** los logs que ves en Console

Con esos logs podré decirte exactamente cuál es el problema.

---

## 💡 COMANDOS ÚTILES

```bash
# Ver viajes disponibles
cd backend
node test-search-trips.js

# Ver solo orígenes
node quick-test-origins.js

# CLI completa
node cli-test.js
```

---

## 📝 CHECKLIST DE VERIFICACIÓN

- [ ] El combobox es clickeable (ya resuelto ✅)
- [ ] Al seleccionar origen, aparece en el botón del combobox
- [ ] Al seleccionar destino, aparece en el botón del combobox
- [ ] Console muestra "origin: ..." con el valor completo (con pipe)
- [ ] Console muestra "destination: ..." con el valor completo
- [ ] Console muestra "main_trips_only: false"
- [ ] Console muestra "total: X" donde X > 0
- [ ] Si total es 0, Network > Response también muestra array vacío

---

¿Qué ves en la Console cuando haces la búsqueda? 🔍

