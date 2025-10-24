-- ============================================
-- OPTIMIZACIÓN DE TRIP_SEGMENTS Y TRIPS
-- Migración para mejorar performance de consultas
-- ============================================

-- ============================================
-- 1. AGREGAR COLUMNAS NECESARIAS
-- ============================================

-- Agregar company_id a trip_segments para multi-tenancy y consultas rápidas
ALTER TABLE trip_segments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Agregar route_template_id a trips para auditoría
ALTER TABLE trips ADD COLUMN IF NOT EXISTS route_template_id UUID REFERENCES route_templates(id) ON DELETE SET NULL;

-- ============================================
-- 2. MIGRACIÓN DE DATOS
-- ============================================

-- Actualizar trip_segments existentes con company_id desde trips
UPDATE trip_segments ts
SET company_id = t.company_id
FROM trips t
WHERE ts.trip_id = t.id
AND ts.company_id IS NULL;

-- ============================================
-- 3. HACER COMPANY_ID NOT NULL
-- ============================================

-- Hacer company_id NOT NULL después de migrar datos
ALTER TABLE trip_segments ALTER COLUMN company_id SET NOT NULL;

-- ============================================
-- 4. ÍNDICES CRÍTICOS PARA PERFORMANCE
-- ============================================

-- Índice 1: Consulta principal - Listado de main trips disponibles
-- Usado en: Vista principal de viajes, consultas por fecha
-- WHERE: company_id = X AND is_main_trip = true AND departure_time >= NOW() AND available_seats > 0
CREATE INDEX IF NOT EXISTS idx_trip_segments_main_trips 
ON trip_segments(company_id, is_main_trip, departure_time DESC) 
WHERE is_main_trip = true AND available_seats > 0;

-- Índice 2: Búsquedas específicas por origen y destino
-- Usado en: Búsqueda de viajes por origen/destino específicos
-- WHERE: company_id = X AND origin = Y AND destination = Z AND available_seats > 0
CREATE INDEX IF NOT EXISTS idx_trip_segments_search 
ON trip_segments(company_id, origin, destination, departure_time DESC)
WHERE available_seats > 0;

-- Índice 3: Consultas por disponibilidad
-- Usado en: Verificación rápida de asientos disponibles
-- WHERE: company_id = X AND available_seats > 0
CREATE INDEX IF NOT EXISTS idx_trip_segments_availability 
ON trip_segments(company_id, available_seats)
WHERE available_seats > 0;

-- Índice 4: Consultas por fecha general
-- Usado en: Filtros por rango de fechas sin otros criterios
CREATE INDEX IF NOT EXISTS idx_trip_segments_departure 
ON trip_segments(departure_time DESC);

-- Índice 5: Índice en company_id para trip_segments (general)
CREATE INDEX IF NOT EXISTS idx_trip_segments_company 
ON trip_segments(company_id) 
WHERE available_seats > 0;

-- ============================================
-- 5. COMENTARIOS EN LAS TABLAS (DOCUMENTACIÓN)
-- ============================================

COMMENT ON COLUMN trip_segments.company_id IS 'ID de la empresa para multi-tenancy y queries rápidas';
COMMENT ON COLUMN trips.route_template_id IS 'Referencia a la plantilla usada para generar este viaje (auditoría)';

COMMENT ON INDEX idx_trip_segments_main_trips IS 'Optimiza consulta principal: main trips disponibles por empresa y fecha';
COMMENT ON INDEX idx_trip_segments_search IS 'Optimiza búsquedas por origen y destino específicos';
COMMENT ON INDEX idx_trip_segments_availability IS 'Optimiza consultas de disponibilidad de asientos';
COMMENT ON INDEX idx_trip_segments_departure IS 'Optimiza ordenamiento y filtrado por fecha de salida';

-- ============================================
-- 6. ANÁLISIS DE PERFORMANCE
-- ============================================

-- Ejecutar ANALYZE para actualizar estadísticas
ANALYZE trip_segments;
ANALYZE trips;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que los índices se crearon correctamente
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('trip_segments', 'trips')
AND indexname LIKE 'idx_trip_segments_%'
ORDER BY indexname;

-- Verificar que company_id está poblado en trip_segments
SELECT 
    COUNT(*) as total_segments,
    COUNT(company_id) as segments_with_company,
    COUNT(*) - COUNT(company_id) as segments_without_company
FROM trip_segments;

-- ============================================
-- NOTAS DE PERFORMANCE
-- ============================================

/*
JUSTIFICACIÓN DE ÍNDICES:

1. idx_trip_segments_main_trips (Partial Index)
   - Más usado: Listado principal de viajes disponibles
   - WHERE clause reduce tamaño del índice ~80%
   - Ordenamiento DESC para viajes próximos primero

2. idx_trip_segments_search (Partial Index)
   - Búsquedas específicas: "Acapulco → CDMX"
   - Composite index: (company_id, origin, destination, departure_time)
   - Solo incluye registros con asientos disponibles

3. idx_trip_segments_availability (Partial Index)
   - Verificación rápida de disponibilidad
   - Útil para dashboards y reportes

4. idx_trip_segments_departure (Simple Index)
   - Consultas por rango de fechas
   - Ordenamiento rápido por fecha

IMPACTO ESPERADO:
- Consulta principal (main trips): ~10-50x más rápida
- Búsquedas específicas: ~5-20x más rápida
- Tamaño total de índices: ~2-3x datos originales
- Write penalty: Mínimo (~5-10% más lento en inserts)

MONITOREO:
Ejecutar este query para ver uso de índices:

SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'trip_segments'
ORDER BY idx_scan DESC;
*/

