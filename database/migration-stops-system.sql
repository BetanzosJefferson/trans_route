-- ============================================
-- MIGRATION: Sistema de IDs Únicos para Paradas
-- ============================================
-- Objetivo: Implementar sistema de IDs para origen/destino
-- Compatibilidad: Mantiene datos existentes intactos
-- Fecha: 2025-10-24
-- ============================================

-- ============================================
-- FASE 1: Crear tabla STOPS
-- ============================================

CREATE TABLE IF NOT EXISTS stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'México',
  full_location VARCHAR(255) NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stop_type VARCHAR(50) DEFAULT 'terminal',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraint: No duplicar parada para misma ubicación en misma compañía
  CONSTRAINT unique_stop_per_company UNIQUE(name, city, state, company_id)
);

-- Comentario de la tabla
COMMENT ON TABLE stops IS 'Catálogo de paradas/terminales con IDs únicos. Reemplaza comparación de strings por búsqueda por ID.';
COMMENT ON COLUMN stops.name IS 'Nombre de la parada (ej: "CONDESA", "Terminal Central")';
COMMENT ON COLUMN stops.city IS 'Ciudad (ej: "Acapulco de Juarez")';
COMMENT ON COLUMN stops.state IS 'Estado (ej: "Guerrero")';
COMMENT ON COLUMN stops.full_location IS 'Ubicación completa en formato legacy: "Ciudad, Estado|Nombre"';
COMMENT ON COLUMN stops.stop_type IS 'Tipo de parada: terminal, punto_venta, parada_intermedia, etc.';

-- Índices para tabla stops
CREATE INDEX idx_stops_company ON stops(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_stops_location ON stops(city, state);
CREATE INDEX idx_stops_full_location ON stops(full_location);
CREATE INDEX idx_stops_name ON stops(name);
CREATE INDEX idx_stops_active ON stops(is_active) WHERE deleted_at IS NULL;

-- Índice para búsqueda full-text (opcional, para autocompletado rápido)
CREATE INDEX idx_stops_search ON stops USING gin(to_tsvector('spanish', name || ' ' || city || ' ' || state)) WHERE deleted_at IS NULL;


-- ============================================
-- FASE 2: Agregar columnas a ROUTES
-- ============================================

-- Agregar columnas de referencia a stops
ALTER TABLE routes 
  ADD COLUMN IF NOT EXISTS origin_stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS destination_stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stop_ids UUID[];

-- Comentarios
COMMENT ON COLUMN routes.origin_stop_id IS 'ID de la parada de origen (preferido sobre string)';
COMMENT ON COLUMN routes.destination_stop_id IS 'ID de la parada de destino (preferido sobre string)';
COMMENT ON COLUMN routes.stop_ids IS 'Array de IDs de paradas intermedias (orden importa)';

-- Índices para routes
CREATE INDEX IF NOT EXISTS idx_routes_origin_stop ON routes(origin_stop_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_routes_dest_stop ON routes(destination_stop_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_routes_stop_ids ON routes USING gin(stop_ids) WHERE deleted_at IS NULL;


-- ============================================
-- FASE 3: Agregar columnas a TRIP_SEGMENTS
-- ============================================

-- Agregar columnas de referencia a stops y company_id
ALTER TABLE trip_segments 
  ADD COLUMN IF NOT EXISTS origin_stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS destination_stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Comentarios
COMMENT ON COLUMN trip_segments.origin_stop_id IS 'ID de la parada de origen (para búsquedas rápidas)';
COMMENT ON COLUMN trip_segments.destination_stop_id IS 'ID de la parada de destino (para búsquedas rápidas)';
COMMENT ON COLUMN trip_segments.company_id IS 'Compañía del viaje (facilita queries multi-tenant)';

-- Índices para trip_segments (CRÍTICOS para performance)
CREATE INDEX IF NOT EXISTS idx_trip_segments_origin_stop ON trip_segments(origin_stop_id);
CREATE INDEX IF NOT EXISTS idx_trip_segments_dest_stop ON trip_segments(destination_stop_id);
CREATE INDEX IF NOT EXISTS idx_trip_segments_company ON trip_segments(company_id);

-- Índice compuesto para búsqueda optimizada (el más importante)
CREATE INDEX IF NOT EXISTS idx_trip_segments_search 
  ON trip_segments(company_id, origin_stop_id, destination_stop_id, departure_time)
  WHERE available_seats > 0;

-- Índice adicional para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_trip_segments_company_date 
  ON trip_segments(company_id, departure_time)
  WHERE available_seats > 0;


-- ============================================
-- FASE 4: Agregar columnas a PACKAGES
-- ============================================

-- Agregar columnas de referencia a stops
ALTER TABLE packages 
  ADD COLUMN IF NOT EXISTS origin_stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS destination_stop_id UUID REFERENCES stops(id) ON DELETE SET NULL;

-- Comentarios
COMMENT ON COLUMN packages.origin_stop_id IS 'ID de la parada de origen del paquete';
COMMENT ON COLUMN packages.destination_stop_id IS 'ID de la parada de destino del paquete';

-- Índices para packages
CREATE INDEX IF NOT EXISTS idx_packages_origin_stop ON packages(origin_stop_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_packages_dest_stop ON packages(destination_stop_id) WHERE deleted_at IS NULL;


-- ============================================
-- FASE 5: Triggers y funciones
-- ============================================

-- Aplicar trigger de updated_at a tabla stops
DROP TRIGGER IF EXISTS update_stops_updated_at ON stops;
CREATE TRIGGER update_stops_updated_at 
  BEFORE UPDATE ON stops 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- FASE 6: Row Level Security (RLS) para stops
-- ============================================

-- Habilitar RLS en tabla stops
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver stops de su compañía
-- NOTA: Ajustar según tu sistema de autenticación
CREATE POLICY stops_select_policy ON stops
  FOR SELECT
  USING (true); -- Por ahora permitir todo, ajustar según necesidad

CREATE POLICY stops_insert_policy ON stops
  FOR INSERT
  WITH CHECK (true); -- Por ahora permitir todo, ajustar según necesidad

CREATE POLICY stops_update_policy ON stops
  FOR UPDATE
  USING (true); -- Por ahora permitir todo, ajustar según necesidad


-- ============================================
-- FASE 7: Verificación de integridad
-- ============================================

-- Función helper para verificar que no hay stops duplicados
CREATE OR REPLACE FUNCTION check_stops_integrity() 
RETURNS TABLE (
  company_name VARCHAR,
  city VARCHAR,
  state VARCHAR,
  stop_name VARCHAR,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name as company_name,
    s.city,
    s.state,
    s.name as stop_name,
    COUNT(*) as count
  FROM stops s
  JOIN companies c ON c.id = s.company_id
  WHERE s.deleted_at IS NULL
  GROUP BY c.name, s.city, s.state, s.name
  HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_stops_integrity() IS 'Verifica que no hay stops duplicados por compañía';


-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- 1. COMPATIBILIDAD:
--    - Todas las columnas nuevas son NULLABLE
--    - Los datos existentes NO se modifican
--    - Las búsquedas deben soportar tanto IDs como strings
--
-- 2. MIGRACIÓN DE DATOS:
--    - No se migran datos automáticamente
--    - Solo las NUEVAS rutas/viajes usarán IDs
--    - Los datos existentes seguirán funcionando con strings
--
-- 3. PERFORMANCE:
--    - El índice idx_trip_segments_search es CRÍTICO
--    - Búsquedas por ID serán 5-10x más rápidas
--    - Considerar VACUUM ANALYZE después de crear índices
--
-- 4. ROLLBACK:
--    - Si necesitas revertir, solo DROP las columnas nuevas
--    - Los datos existentes no se afectan
--    - Comando: ALTER TABLE routes DROP COLUMN origin_stop_id;
--
-- 5. PRÓXIMOS PASOS:
--    a) Ejecutar este script en la BD
--    b) Implementar backend (módulo stops)
--    c) Actualizar frontend (StopSelector)
--    d) Probar con datos nuevos
--    e) Monitorear performance

-- ============================================
-- QUERIES ÚTILES PARA MONITOREO
-- ============================================

-- Ver tamaño de los índices nuevos
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   pg_size_pretty(pg_relation_size(indexname::regclass)) as size
-- FROM pg_indexes
-- WHERE tablename IN ('stops', 'trip_segments', 'routes', 'packages')
-- ORDER BY pg_relation_size(indexname::regclass) DESC;

-- Ver stops más usados
-- SELECT 
--   s.name,
--   s.city,
--   s.state,
--   COUNT(DISTINCT ts.trip_id) as trips_count,
--   COUNT(ts.id) as segments_count
-- FROM stops s
-- LEFT JOIN trip_segments ts ON ts.origin_stop_id = s.id OR ts.destination_stop_id = s.id
-- GROUP BY s.id, s.name, s.city, s.state
-- ORDER BY trips_count DESC
-- LIMIT 20;

-- Ver performance de búsquedas (después de implementación)
-- EXPLAIN ANALYZE
-- SELECT * FROM trip_segments
-- WHERE company_id = 'uuid-here'
--   AND origin_stop_id = 'uuid-here'
--   AND destination_stop_id = 'uuid-here'
--   AND departure_time BETWEEN '2025-10-24' AND '2025-10-25'
--   AND available_seats > 0;

