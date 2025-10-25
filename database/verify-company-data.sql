-- =====================================================
-- QUERIES PARA VERIFICAR DATOS DE LA EMPRESA
-- Company ID: d8d8448b-3689-4713-a56a-0183a1a7c70f
-- =====================================================

-- 1. Verificar STOPS
SELECT 
  '1. STOPS' as seccion,
  COUNT(*) as total
FROM stops
WHERE company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f';

SELECT 
  id,
  name,
  city,
  state,
  full_location
FROM stops
WHERE company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'
ORDER BY name;

-- 2. Verificar ROUTES
SELECT 
  '2. ROUTES' as seccion,
  COUNT(*) as total
FROM routes
WHERE company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f';

SELECT 
  id,
  name,
  origin_stop_id,
  destination_stop_id,
  stop_ids,
  origin,  -- String legacy (debería estar NULL idealmente)
  destination  -- String legacy (debería estar NULL idealmente)
FROM routes
WHERE company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'
ORDER BY name;

-- 3. Verificar TRIPS
SELECT 
  '3. TRIPS' as seccion,
  COUNT(*) as total,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as activos,
  COUNT(CASE WHEN visibility = 'published' THEN 1 END) as publicados
FROM trips
WHERE company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f';

SELECT 
  t.id,
  t.departure_datetime,
  t.visibility,
  t.deleted_at,
  t.capacity,
  r.name as route_name
FROM trips t
JOIN routes r ON t.route_id = r.id
WHERE t.company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'
ORDER BY t.departure_datetime DESC;

-- 4. Verificar TRIP_SEGMENTS
SELECT 
  '4. TRIP_SEGMENTS' as seccion,
  COUNT(*) as total,
  COUNT(origin_stop_id) as con_origin_stop_id,
  COUNT(destination_stop_id) as con_destination_stop_id,
  COUNT(CASE WHEN is_main_trip THEN 1 END) as main_trips
FROM trip_segments
WHERE company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f';

SELECT 
  ts.id,
  ts.origin,
  ts.origin_stop_id,
  ts.destination,
  ts.destination_stop_id,
  ts.is_main_trip,
  ts.departure_time,
  ts.available_seats,
  ts.price,
  t.visibility as trip_visibility,
  t.deleted_at as trip_deleted
FROM trip_segments ts
JOIN trips t ON ts.trip_id = t.id
WHERE ts.company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'
ORDER BY ts.departure_time DESC;

-- 5. Verificar RELACIÓN STOPS (JOIN test)
SELECT 
  ts.id as segment_id,
  ts.origin,
  ts.origin_stop_id,
  origin_stop.name as origin_stop_name,
  origin_stop.city as origin_city,
  ts.destination,
  ts.destination_stop_id,
  dest_stop.name as dest_stop_name,
  dest_stop.city as dest_city,
  ts.departure_time,
  ts.available_seats,
  t.visibility,
  t.deleted_at
FROM trip_segments ts
JOIN trips t ON ts.trip_id = t.id
LEFT JOIN stops origin_stop ON ts.origin_stop_id = origin_stop.id
LEFT JOIN stops dest_stop ON ts.destination_stop_id = dest_stop.id
WHERE ts.company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f';

-- 6. SIMULAR QUERY DEL BACKEND (main trips only)
SELECT 
  ts.id,
  ts.origin,
  ts.destination,
  ts.origin_stop_id,
  ts.destination_stop_id,
  ts.departure_time,
  ts.available_seats,
  ts.price,
  ts.is_main_trip,
  t.visibility,
  t.deleted_at
FROM trip_segments ts
INNER JOIN trips t ON ts.trip_id = t.id
WHERE ts.company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'
  AND ts.departure_time >= NOW()
  AND ts.departure_time <= NOW() + INTERVAL '30 days'
  AND ts.available_seats > 0
  AND t.deleted_at IS NULL
  AND t.visibility = 'published'
  AND ts.is_main_trip = true
ORDER BY ts.departure_time ASC;

-- 7. VERIFICAR SI EXISTE ALGÚN PROBLEMA CON LOS IDs NULL
SELECT 
  'Segments sin origin_stop_id' as problema,
  COUNT(*) as cantidad
FROM trip_segments ts
JOIN trips t ON ts.trip_id = t.id
WHERE ts.company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'
  AND ts.origin_stop_id IS NULL
  AND t.deleted_at IS NULL;

SELECT 
  'Segments sin destination_stop_id' as problema,
  COUNT(*) as cantidad
FROM trip_segments ts
JOIN trips t ON ts.trip_id = t.id
WHERE ts.company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'
  AND ts.destination_stop_id IS NULL
  AND t.deleted_at IS NULL;

-- 8. BUSCAR STOPS QUE NO EXISTEN (foreign key problems)
SELECT 
  ts.id as segment_id,
  ts.origin_stop_id,
  'origin' as tipo
FROM trip_segments ts
LEFT JOIN stops s ON ts.origin_stop_id = s.id
WHERE ts.company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'
  AND ts.origin_stop_id IS NOT NULL
  AND s.id IS NULL

UNION ALL

SELECT 
  ts.id as segment_id,
  ts.destination_stop_id,
  'destination' as tipo
FROM trip_segments ts
LEFT JOIN stops s ON ts.destination_stop_id = s.id
WHERE ts.company_id = 'd8d8448b-3689-4713-a56a-0183a1a7c70f'
  AND ts.destination_stop_id IS NOT NULL
  AND s.id IS NULL;

