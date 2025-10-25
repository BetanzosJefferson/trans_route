# 🔴 PROBLEMA IDENTIFICADO - Company ID Inválido

## 🎯 EL PROBLEMA

La búsqueda no devuelve resultados porque el `company_id` que el frontend está usando **NO EXISTE** en la base de datos.

```
❌ Frontend usa:  d8d8448b-d689-4713-a56a-0183a1a7c70f
                           ↑↑↑↑
✅ BD tiene:      d8d8448b-3689-4713-a56a-0183a1a7c70f
                           ↑↑↑↑
```

**Diferencia:** Posición 13-16: `"d689"` vs `"3689"`

---

## 🔍 VERIFICACIÓN REALIZADA

### Test 1: Valores Exactos del Frontend
```bash
cd backend
node test-exact-search.js
```

**Resultado:**
- ❌ NO existe el origen en la BD
- ❌ NO existe el destino en la BD
- ❌ 0 segments disponibles para ese company_id
- **Conclusión:** El company_id no tiene datos

---

### Test 2: Empresas en la BD
```
✅ TransRoute Demo
   ID: 11111111-1111-1111-1111-111111111111
   Segments para 2025-10-24: 0

✅ BAMO VIAJES
   ID: d8d8448b-3689-4713-a56a-0183a1a7c70f
   Segments para 2025-10-24: 2  ← AQUÍ HAY DATOS
```

---

### Test 3: Usuarios
```
✅ ivanbahenabetanzos@gmail.com
   Company: BAMO VIAJES
   ID: d8d8448b-3689-4713-a56a-0183a1a7c70f  ← CORRECTO

✅ owner/admin/cashier/driver@transroute.com
   Company: TransRoute Demo
   ID: 11111111-1111-1111-1111-111111111111

❌ bahenawilliamjefferson@gmail.com
   Company ID: null  ← SIN EMPRESA
```

---

## 🐛 CAUSAS POSIBLES

### 1. Usuario sin Company ID Asignado
El usuario actual no tiene `company_id` asignado en la tabla `users`.

**Solución:** Asignar un `company_id` válido al usuario.

---

### 2. Company ID Corrupto
El `company_id` está mal formado o corrupto en alguna parte del proceso.

**Solución:** Verificar de dónde viene ese ID (`d689` en lugar de `3689`).

---

### 3. Cache del Frontend
El frontend tiene un `company_id` viejo en el state o localStorage.

**Solución:** Limpiar cache y recargar.

---

## ✅ SOLUCIÓN INMEDIATA

### Opción A: Asignar Company ID al Usuario Actual

Si estás logueado con `bahenawilliamjefferson@gmail.com`:

```sql
-- En Supabase SQL Editor
UPDATE users 
SET company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'  -- BAMO VIAJES (con 3689)
WHERE email = 'bahenawilliamjefferson@gmail.com';
```

---

### Opción B: Loguearte con Usuario que Tiene Datos

```
Email: ivanbahenabetanzos@gmail.com
Company: BAMO VIAJES (tiene 2 viajes disponibles)
```

---

### Opción C: Crear Viajes para TransRoute Demo

Si quieres usar los usuarios demo:

```sql
-- Usar la CLI o scripts para crear viajes
cd backend
node cli-test.js
# Seleccionar opción 6 para consulta personalizada
```

---

## 🔧 DEBUGGING EN EL NAVEGADOR

He agregado logging para ver qué usuario está activo:

1. Abre el navegador
2. Ve a Nueva Reserva
3. Abre DevTools Console (F12)
4. Busca este log:

```javascript
👤 Usuario actual: {
  email: "...",
  name: "...",
  company_id: "..."  // ← VERIFICA ESTE VALOR
}
```

---

## 📊 VERIFICACIÓN RÁPIDA

Para confirmar si un `company_id` tiene viajes:

```bash
cd backend

# Verificar con Node
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

(async () => {
  const companyId = 'PEGA-AQUI-EL-ID';
  
  const { data } = await supabase
    .from('trip_segments')
    .select('id')
    .eq('company_id', companyId)
    .gte('departure_time', new Date().toISOString());
  
  console.log('Segments disponibles:', data?.length || 0);
})().then(() => process.exit(0));
"
```

---

## 🎯 CHECKLIST DE SOLUCIÓN

- [ ] Verificar en Console qué company_id está usando el frontend
- [ ] Comparar con los company_id válidos en la BD
- [ ] Si no coincide, actualizar el usuario en la BD
- [ ] O loguearte con un usuario que tenga company_id válido
- [ ] Recargar la página y verificar que ahora sí aparezcan viajes

---

## 📝 ARCHIVOS MODIFICADOS

```
✅ frontend/src/app/(dashboard)/dashboard/nueva-reserva/page.tsx
   - Agregado logging del usuario y company_id

✅ backend/test-exact-search.js (nuevo)
   - Test con los valores exactos del frontend
   - Identifica si existe el company_id y tiene datos
```

---

## 💡 PRÓXIMOS PASOS

1. **Abre DevTools Console**
2. **Verifica el log** "👤 Usuario actual"
3. **Copia el company_id** que muestra
4. **Compáralo** con los IDs válidos:
   - `d8d8448b-3689-4713-a56a-0183a1a7c70f` (BAMO VIAJES) ✅
   - `11111111-1111-1111-1111-111111111111` (TransRoute Demo) ✅
5. **Si no coincide**, actualiza el usuario en la BD

---

## 🚀 SOLUCIÓN RÁPIDA SQL

```sql
-- VER usuarios y sus company_id
SELECT email, first_name, last_name, company_id 
FROM users;

-- ASIGNAR company_id a un usuario
UPDATE users 
SET company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'  -- BAMO VIAJES
WHERE email = 'TU-EMAIL@AQUI.com';

-- VERIFICAR que tiene viajes
SELECT COUNT(*) 
FROM trip_segments 
WHERE company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'
AND departure_time >= NOW();
```

---

¿Qué company_id muestra el log en la Console? 🔍

