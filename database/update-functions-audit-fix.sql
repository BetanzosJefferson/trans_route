-- =====================================================
-- FIX: Corrección de audit_logs en funciones
-- =====================================================
-- Ejecutar este archivo en Supabase SQL Editor
-- Corrige el uso de columnas incorrectas en audit_logs

-- 0. Función: create_reservation_with_transaction()
CREATE OR REPLACE FUNCTION create_reservation_with_transaction(
  p_trip_segment_id UUID,
  p_client_id UUID,
  p_seats_reserved INT,
  p_total_amount DECIMAL(10,2),
  p_payment_status payment_status,
  p_amount_paid DECIMAL(10,2),
  p_payment_method payment_method,
  p_user_id UUID,
  p_company_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_reservation_id UUID;
  v_transaction_id UUID;
  v_available_seats INT;
  v_segment_price DECIMAL(10,2);
BEGIN
  -- 1. Validar disponibilidad de asientos
  SELECT available_seats, price INTO v_available_seats, v_segment_price
  FROM trip_segments
  WHERE id = p_trip_segment_id;
  
  IF v_available_seats IS NULL THEN
    RAISE EXCEPTION 'Segmento de viaje no encontrado';
  END IF;
  
  IF v_available_seats < p_seats_reserved THEN
    RAISE EXCEPTION 'No hay suficientes asientos disponibles (disponibles: %, solicitados: %)', 
      v_available_seats, p_seats_reserved;
  END IF;
  
  -- 2. Crear reserva SIN amount_paid (se calcula por la vista)
  INSERT INTO reservations (
    client_id,
    trip_segment_id,
    seats_reserved,
    total_amount,
    payment_status,
    company_id,
    created_by_user_id,
    status,
    notes
  ) VALUES (
    p_client_id,
    p_trip_segment_id,
    p_seats_reserved,
    p_total_amount,
    p_payment_status,
    p_company_id,
    p_user_id,
    'confirmed',
    p_notes
  ) RETURNING id INTO v_reservation_id;
  
  -- 3. Si hay pago, crear transacción
  IF p_payment_status IN ('paid', 'partial') AND p_amount_paid > 0 THEN
    INSERT INTO transactions (
      source_type,
      source_id,
      type,
      amount,
      payment_method,
      user_id,
      company_id,
      notes
    ) VALUES (
      'reservation',
      v_reservation_id,
      CASE 
        WHEN p_payment_status = 'paid' THEN 'ticket'::transaction_type
        ELSE 'ticket_deposit'::transaction_type
      END,
      p_amount_paid,
      p_payment_method,
      p_user_id,
      p_company_id,
      CASE 
        WHEN p_payment_status = 'paid' THEN 'Pago completo de reserva'
        ELSE 'Anticipo de reserva'
      END
    ) RETURNING id INTO v_transaction_id;
  END IF;
  
  -- 4. Crear log de auditoría
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action_type,
    old_data,
    new_data,
    user_id
  ) VALUES (
    'reservations',
    v_reservation_id,
    'create',
    '{}'::jsonb,
    jsonb_build_object(
      'trip_segment_id', p_trip_segment_id,
      'client_id', p_client_id,
      'seats_reserved', p_seats_reserved,
      'total_amount', p_total_amount,
      'payment_status', p_payment_status
    ),
    p_user_id
  );
  
  RETURN jsonb_build_object(
    'reservation_id', v_reservation_id,
    'transaction_id', v_transaction_id,
    'success', true
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error en transacción: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

