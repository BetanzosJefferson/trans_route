# 🎯 Migración: Sistema de IDs para Paradas

## 📋 Resumen

Este archivo implementa un sistema de IDs únicos para paradas (origen/destino) en lugar de comparación de strings.

**Archivo:** `migration-stops-system.sql`

---

## ✅ Qué hace este script

### 1. **Crea tabla `stops`**
   - Catálogo centralizado de todas las paradas
   - Cada parada tiene un UUID único
   - Incluye: nombre, ciudad, estado, company_id
   - Constraint UNIQUE por compañía para evitar duplicados

### 2. **Agrega columnas a tablas existentes**
   - **routes**: `origin_stop_id`, `destination_stop_id`, `stop_ids`
   - **trip_segments**: `origin_stop_id`, `destination_stop_id`, `company_id`
   - **packages**: `origin_stop_id`, `destination_stop_id`
   - ✅ Todas las columnas son **OPCIONALES** (nullable)
   - ✅ **NO modifica datos existentes**

### 3. **Crea índices para optimización**
   - Índices en cada `*_stop_id` para búsquedas rápidas
   - **Índice compuesto crítico**: `(company_id, origin_stop_id, destination_stop_id, departure_time)`
   - Índice full-text para búsqueda de paradas por nombre

### 4. **Configura RLS y triggers**
   - Row Level Security en tabla `stops`
   - Trigger `updated_at` automático

---

## 🚀 Cómo ejecutar

### Opción A: Desde Supabase Dashboard

1. Ve a tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Crea un nuevo query
4. Copia y pega el contenido de `migration-stops-system.sql`
5. Clic en **RUN**
6. Verifica que no haya errores

### Opción B: Desde psql (CLI)

```bash
# Conectar a tu base de datos
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# Ejecutar el script
\i database/migration-stops-system.sql

# Verificar que se creó la tabla
\d stops
```

### Opción C: Usando script automatizado

```bash
# Desde la raíz del proyecto
cd database
psql $DATABASE_URL -f migration-stops-system.sql
```

---

## ✅ Verificación

Después de ejecutar el script, verifica:

### 1. Tabla `stops` creada

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'stops';
```

Resultado esperado: 1 fila

### 2. Columnas agregadas a `routes`

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'routes' 
  AND column_name IN ('origin_stop_id', 'destination_stop_id', 'stop_ids');
```

Resultado esperado: 3 filas

### 3. Columnas agregadas a `trip_segments`

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'trip_segments' 
  AND column_name IN ('origin_stop_id', 'destination_stop_id', 'company_id');
```

Resultado esperado: 3 filas

### 4. Índices creados

```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'trip_segments' 
  AND indexname LIKE '%stop%';
```

Resultado esperado: 4+ índices

---

## 🔍 Queries de verificación útiles

### Ver estructura de tabla `stops`

```sql
\d stops
```

### Contar stops por compañía

```sql
SELECT c.name, COUNT(s.id) as stops_count
FROM companies c
LEFT JOIN stops s ON s.company_id = c.id
WHERE s.deleted_at IS NULL
GROUP BY c.name;
```

### Ver tamaño de índices nuevos

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE tablename IN ('stops', 'trip_segments', 'routes', 'packages')
  AND indexname LIKE '%stop%'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

### Verificar integridad (no duplicados)

```sql
SELECT * FROM check_stops_integrity();
```

Si devuelve filas, hay duplicados que deben resolverse.

---

## ⚠️ Importante

### 1. **Backup primero**

Antes de ejecutar:

```bash
# Hacer backup de la BD
pg_dump $DATABASE_URL > backup_before_stops_migration.sql
```

### 2. **No afecta datos existentes**

- ✅ Rutas actuales siguen funcionando con strings
- ✅ Viajes actuales siguen funcionando
- ✅ Reservaciones existentes no se tocan
- ✅ Solo nuevos datos usarán IDs

### 3. **Rollback si necesario**

Si algo sale mal:

```sql
-- Eliminar tabla stops
DROP TABLE IF EXISTS stops CASCADE;

-- Eliminar columnas agregadas
ALTER TABLE routes 
  DROP COLUMN IF EXISTS origin_stop_id,
  DROP COLUMN IF EXISTS destination_stop_id,
  DROP COLUMN IF EXISTS stop_ids;

ALTER TABLE trip_segments 
  DROP COLUMN IF EXISTS origin_stop_id,
  DROP COLUMN IF EXISTS destination_stop_id;
  -- NO eliminar company_id si ya existía

ALTER TABLE packages 
  DROP COLUMN IF EXISTS origin_stop_id,
  DROP COLUMN IF EXISTS destination_stop_id;
```

---

## 📊 Performance esperado

### Antes (búsqueda por string)

```sql
-- Query lenta (escanea toda la tabla)
SELECT * FROM trip_segments
WHERE origin = 'Acapulco de Juarez, Guerrero|CONDESA'
  AND destination = 'Cuernavaca, Morelos|Polvorin';
```

Tiempo: ~200-500ms con 10,000 segments

### Después (búsqueda por ID)

```sql
-- Query rápida (usa índice)
SELECT * FROM trip_segments
WHERE origin_stop_id = 'uuid-123'
  AND destination_stop_id = 'uuid-456';
```

Tiempo: ~10-50ms con 10,000 segments

**Mejora esperada:** 5-10x más rápido

---

## 🎯 Próximos pasos

Después de ejecutar este script:

1. ✅ **Verificar** que todo se creó correctamente (ver sección Verificación)
2. 🔧 **Backend**: Implementar módulo `stops` en NestJS
3. 🎨 **Frontend**: Crear componente `StopSelector`
4. 🧪 **Probar**: Crear nuevas rutas/viajes usando IDs
5. 📊 **Monitorear**: Performance de búsquedas

---

## 🆘 Problemas comunes

### Error: "relation stops already exists"

**Causa:** El script ya se ejecutó antes

**Solución:** 
```sql
DROP TABLE IF EXISTS stops CASCADE;
-- Luego re-ejecutar el script
```

### Error: "column origin_stop_id already exists"

**Causa:** Las columnas ya existen

**Solución:** El script usa `ADD COLUMN IF NOT EXISTS`, pero si hay error:
```sql
ALTER TABLE routes DROP COLUMN IF EXISTS origin_stop_id CASCADE;
-- Luego re-ejecutar el script
```

### Error: "permission denied"

**Causa:** Usuario no tiene permisos CREATE TABLE

**Solución:** Ejecutar como superusuario o pedir permisos al DBA

---

## 📚 Referencias

- Plan completo: `/fix-combobox-issues.plan.md`
- Schema original: `/database/schema.sql`
- Issues relacionados: Backend duplicados resuelto en `✅ PROBLEMA-RESUELTO-BACKENDS-DUPLICADOS.md`

---

## ✅ Checklist de ejecución

- [ ] Hacer backup de la base de datos
- [ ] Ejecutar `migration-stops-system.sql`
- [ ] Verificar tabla `stops` creada
- [ ] Verificar columnas en `routes`
- [ ] Verificar columnas en `trip_segments`
- [ ] Verificar columnas en `packages`
- [ ] Verificar índices creados
- [ ] Probar query de ejemplo
- [ ] Documentar resultado en equipo

---

**Fecha de creación:** 2025-10-24  
**Versión:** 1.0  
**Estado:** ✅ Listo para ejecutar

