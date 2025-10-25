-- =====================================================
-- Script para poblar origin_stop_id y destination_stop_id
-- en trip_segments existentes
-- =====================================================

-- 1. Insertar stops desde trip_segments existentes (solo los que no existen)
INSERT INTO stops (company_id, name, city, state, country, full_location)
SELECT DISTINCT 
  ts.company_id,
  COALESCE(
    NULLIF(SPLIT_PART(ts.origin, '|', 2), ''),
    SPLIT_PART(SPLIT_PART(ts.origin, ',', 1), ',', 1)
  ) as name,
  TRIM(SPLIT_PART(ts.origin, ',', 1)) as city,
  TRIM(SPLIT_PART(SPLIT_PART(ts.origin, '|', 1), ',', 2)) as state,
  'Mexico' as country,
  ts.origin as full_location
FROM trip_segments ts
WHERE ts.origin_stop_id IS NULL
  AND ts.origin IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM stops s 
    WHERE s.company_id = ts.company_id 
    AND s.full_location = ts.origin
  )
ON CONFLICT (company_id, full_location) DO NOTHING;

-- 2. Insertar stops de destinos
INSERT INTO stops (company_id, name, city, state, country, full_location)
SELECT DISTINCT 
  ts.company_id,
  COALESCE(
    NULLIF(SPLIT_PART(ts.destination, '|', 2), ''),
    SPLIT_PART(SPLIT_PART(ts.destination, ',', 1), ',', 1)
  ) as name,
  TRIM(SPLIT_PART(ts.destination, ',', 1)) as city,
  TRIM(SPLIT_PART(SPLIT_PART(ts.destination, '|', 1), ',', 2)) as state,
  'Mexico' as country,
  ts.destination as full_location
FROM trip_segments ts
WHERE ts.destination_stop_id IS NULL
  AND ts.destination IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM stops s 
    WHERE s.company_id = ts.company_id 
    AND s.full_location = ts.destination
  )
ON CONFLICT (company_id, full_location) DO NOTHING;

-- 3. Actualizar origin_stop_id en trip_segments
UPDATE trip_segments ts
SET origin_stop_id = s.id
FROM stops s
WHERE ts.origin_stop_id IS NULL
  AND ts.company_id = s.company_id
  AND ts.origin = s.full_location;

-- 4. Actualizar destination_stop_id en trip_segments
UPDATE trip_segments ts
SET destination_stop_id = s.id
FROM stops s
WHERE ts.destination_stop_id IS NULL
  AND ts.company_id = s.company_id
  AND ts.destination = s.full_location;

-- 5. Verificar resultados
SELECT 
  COUNT(*) as total_segments,
  COUNT(origin_stop_id) as segments_with_origin_id,
  COUNT(destination_stop_id) as segments_with_dest_id,
  COUNT(CASE WHEN origin_stop_id IS NOT NULL AND destination_stop_id IS NOT NULL THEN 1 END) as segments_complete
FROM trip_segments;

-- 6. Mostrar stops creados
SELECT 
  company_id,
  COUNT(*) as total_stops,
  COUNT(DISTINCT city) as unique_cities,
  COUNT(DISTINCT state) as unique_states
FROM stops
GROUP BY company_id;

