-- =====================================================
-- Script de prueba para debug de creación de reserva
-- =====================================================

-- 1. Verificar que la función existe
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname = 'update_trip_segment_availability';

-- 2. Verificar que el trigger está activo
SELECT 
  tgname,
  tgtype,
  tgenabled
FROM pg_trigger 
WHERE tgname = 'trg_update_trip_segment_availability';

-- 3. Ver un trip_segment de ejemplo con sus datos
SELECT 
  ts.id as segment_id,
  ts.trip_id,
  ts.origin_stop_id,
  ts.destination_stop_id,
  ts.available_seats,
  ts.price,
  t.route_id,
  r.origin_stop_id as route_origin_stop_id,
  r.stop_ids as route_stop_ids,
  r.destination_stop_id as route_destination_stop_id
FROM trip_segments ts
JOIN trips t ON ts.trip_id = t.id
JOIN routes r ON t.route_id = r.id
LIMIT 1;

-- 4. Intentar crear una reserva de prueba (comentado por seguridad)
/*
-- Reemplaza estos valores con datos reales de tu base de datos:
SELECT create_reservation_with_transaction(
  'TU_TRIP_SEGMENT_ID'::UUID,    -- p_trip_segment_id
  'TU_CLIENT_ID'::UUID,           -- p_client_id
  1,                              -- p_seats_reserved
  100.00,                         -- p_total_amount
  'paid'::payment_status,         -- p_payment_status
  100.00,                         -- p_amount_paid
  'cash'::payment_method,         -- p_payment_method
  'TU_USER_ID'::UUID,             -- p_user_id
  'TU_COMPANY_ID'::UUID,          -- p_company_id
  'Prueba'                        -- p_notes
);
*/

