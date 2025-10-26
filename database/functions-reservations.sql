-- =====================================================
-- FUNCIONES POSTGRESQL: Sistema de Gestión de Reservaciones
-- Fecha: 2025-10-26
-- Descripción: Funciones para gestión completa de reservaciones
--              (creación, cancelaciones con reembolso, modificaciones, pagos)
-- =====================================================

-- =====================================================
-- 0. FUNCIÓN: create_reservation_with_transaction()
-- =====================================================
-- Crea una nueva reserva y opcionalmente una transacción de pago
-- Valida disponibilidad de asientos
-- NO inserta amount_paid (se calcula dinámicamente por la vista)
--
-- Parámetros:
--   p_trip_segment_id: ID del segmento de viaje
--   p_client_id: ID del cliente
--   p_seats_reserved: Cantidad de asientos a reservar
--   p_total_amount: Monto total de la reserva
--   p_payment_status: Estado de pago (pending, partial, paid)
--   p_amount_paid: Monto pagado (para crear transacción)
--   p_payment_method: Método de pago (cash, transfer, card)
--   p_user_id: ID del usuario que crea la reserva
--   p_company_id: ID de la compañía
--   p_notes: Notas opcionales
--
-- Retorna: JSONB con {reservation_id, transaction_id, success}
-- =====================================================

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

-- =====================================================
-- 1. FUNCIÓN: get_user_cash_balance()
-- =====================================================
-- Calcula el saldo en caja del usuario (transacciones sin corte)
-- 
-- Parámetros:
--   p_user_id: ID del usuario
--   p_company_id: ID de la compañía
--
-- Retorna: DECIMAL con el saldo total
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_cash_balance(
  p_user_id UUID,
  p_company_id UUID
) RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_balance DECIMAL(10, 2);
BEGIN
  -- Sumar todas las transacciones sin corte (box_cutoff_id IS NULL)
  SELECT COALESCE(SUM(amount), 0) INTO v_balance
  FROM transactions
  WHERE user_id = p_user_id 
    AND company_id = p_company_id
    AND box_cutoff_id IS NULL;  -- Solo transacciones sin corte
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. FUNCIÓN: cancel_reservation_with_refund()
-- =====================================================
-- Cancela una reserva y opcionalmente procesa un reembolso
-- Valida que el usuario tenga suficiente saldo en caja
-- Restaura asientos automáticamente via trigger
--
-- Parámetros:
--   p_reservation_id: ID de la reserva a cancelar
--   p_user_id: ID del usuario que realiza la cancelación
--   p_refund_amount: Monto a reembolsar (0 si no hay reembolso)
--   p_cancellation_reason: Razón de la cancelación
--   p_payment_method: Método de pago para el reembolso
--
-- Retorna: JSONB con {success, refund_amount, new_balance}
-- =====================================================

CREATE OR REPLACE FUNCTION cancel_reservation_with_refund(
  p_reservation_id UUID,
  p_user_id UUID,
  p_refund_amount DECIMAL(10, 2),
  p_cancellation_reason TEXT,
  p_payment_method payment_method
) RETURNS jsonb AS $$
DECLARE
  v_reservation RECORD;
  v_user_balance DECIMAL(10, 2);
  v_new_balance DECIMAL(10, 2);
BEGIN
  -- 1. Obtener reserva
  SELECT * INTO v_reservation FROM reservations WHERE id = p_reservation_id;
  
  IF NOT FOUND THEN 
    RAISE EXCEPTION 'Reserva no encontrada con ID: %', p_reservation_id; 
  END IF;
  
  -- Validar que no esté ya cancelada
  IF v_reservation.status = 'cancelled' THEN
    RAISE EXCEPTION 'La reserva ya está cancelada';
  END IF;
  
  -- 2. Si hay reembolso, validar saldo en caja
  IF p_refund_amount > 0 THEN
    v_user_balance := get_user_cash_balance(p_user_id, v_reservation.company_id);
    
    IF v_user_balance < p_refund_amount THEN
      RAISE EXCEPTION 'Saldo insuficiente en caja. Disponible: $%, Requerido: $%', 
        v_user_balance, p_refund_amount;
    END IF;
    
    -- Crear transacción de reembolso (monto NEGATIVO, sin box_cutoff_id)
    -- El monto negativo resta del saldo en caja del usuario
    INSERT INTO transactions (
      source_type, 
      source_id, 
      type, 
      amount, 
      payment_method, 
      user_id, 
      company_id, 
      box_cutoff_id, 
      notes,
      created_at
    )
    VALUES (
      'reservation', 
      p_reservation_id, 
      'refund', 
      -p_refund_amount,  -- NEGATIVO para restar del saldo
      p_payment_method, 
      p_user_id, 
      v_reservation.company_id, 
      NULL,  -- Sin corte, afecta saldo actual
      'Reembolso por cancelación',
      NOW()
    );
  END IF;
  
  -- 3. Actualizar reserva como cancelada
  UPDATE reservations
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    cancellation_reason = p_cancellation_reason,
    refund_amount = p_refund_amount,
    last_updated_by_user_id = p_user_id,
    updated_at = NOW()
  WHERE id = p_reservation_id;
  
  -- 4. Los asientos se restauran automáticamente
  --    via trigger update_trip_segment_availability
  --    (detecta status = 'cancelled' y suma seats_reserved)
  
  -- 5. Audit log
  INSERT INTO audit_logs (
    table_name, 
    record_id, 
    action_type, 
    user_id, 
    old_data,
    new_data
  )
  VALUES (
    'reservations', 
    p_reservation_id, 
    'status_change', 
    p_user_id, 
    jsonb_build_object(
      'status', v_reservation.status
    ),
    jsonb_build_object(
      'action', 'cancelled', 
      'refund_amount', p_refund_amount, 
      'reason', p_cancellation_reason
    )
  );
  
  -- 6. Calcular nuevo saldo
  v_new_balance := get_user_cash_balance(p_user_id, v_reservation.company_id);
  
  RETURN jsonb_build_object(
    'success', true, 
    'refund_amount', p_refund_amount, 
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. FUNCIÓN: modify_reservation_trip()
-- =====================================================
-- Modifica el viaje de una reserva (cambio de fecha/hora)
-- Valida disponibilidad y maneja asientos automáticamente
--
-- Parámetros:
--   p_reservation_id: ID de la reserva a modificar
--   p_new_trip_segment_id: ID del nuevo segmento de viaje
--   p_user_id: ID del usuario que realiza la modificación
--
-- Retorna: JSONB con {success: true}
-- =====================================================

CREATE OR REPLACE FUNCTION modify_reservation_trip(
  p_reservation_id UUID,
  p_new_trip_segment_id UUID,
  p_user_id UUID
) RETURNS jsonb AS $$
DECLARE
  v_old_segment_id UUID;
  v_seats INT;
  v_company_id UUID;
  v_available_seats INT;
  v_reservation_status reservation_status;
BEGIN
  -- 1. Obtener reserva actual
  SELECT 
    trip_segment_id, 
    seats_reserved, 
    company_id,
    status
  INTO 
    v_old_segment_id, 
    v_seats, 
    v_company_id,
    v_reservation_status
  FROM reservations 
  WHERE id = p_reservation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reserva no encontrada con ID: %', p_reservation_id;
  END IF;
  
  -- Validar que no esté cancelada
  IF v_reservation_status = 'cancelled' THEN
    RAISE EXCEPTION 'No se puede modificar una reserva cancelada';
  END IF;
  
  -- Validar que no sea el mismo segmento
  IF v_old_segment_id = p_new_trip_segment_id THEN
    RAISE EXCEPTION 'El nuevo segmento es el mismo que el actual';
  END IF;
  
  -- 2. Validar disponibilidad en nuevo segment
  SELECT available_seats 
  INTO v_available_seats 
  FROM trip_segments 
  WHERE id = p_new_trip_segment_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Segmento de viaje no encontrado con ID: %', p_new_trip_segment_id;
  END IF;
  
  IF v_available_seats < v_seats THEN
    RAISE EXCEPTION 'Asientos insuficientes. Disponibles: %, Requeridos: %', 
      v_available_seats, v_seats;
  END IF;
  
  -- 3. Actualizar reserva
  --    El trigger update_trip_segment_availability maneja automáticamente:
  --    - Restaurar asientos en el segmento viejo (y sus afectados)
  --    - Decrementar asientos en el segmento nuevo (y sus afectados)
  UPDATE reservations
  SET 
    trip_segment_id = p_new_trip_segment_id,
    last_updated_by_user_id = p_user_id,
    updated_at = NOW()
  WHERE id = p_reservation_id;
  
  -- 4. Audit log
  INSERT INTO audit_logs (
    table_name, 
    record_id, 
    action_type, 
    user_id, 
    old_data,
    new_data
  )
  VALUES (
    'reservations', 
    p_reservation_id, 
    'update', 
    p_user_id, 
    jsonb_build_object(
      'trip_segment_id', v_old_segment_id
    ),
    jsonb_build_object(
      'trip_segment_id', p_new_trip_segment_id
    )
  );
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FUNCIÓN: add_payment_to_reservation()
-- =====================================================
-- Agrega un pago a una reserva existente
-- Soporta pagos mixtos (múltiples transacciones)
-- Valida que no se exceda el total
--
-- Parámetros:
--   p_reservation_id: ID de la reserva
--   p_amount: Monto del pago
--   p_payment_method: Método de pago (cash, transfer, card)
--   p_user_id: ID del usuario que registra el pago
--   p_company_id: ID de la compañía
--
-- Retorna: JSONB con {success, total_paid, remaining}
-- =====================================================

CREATE OR REPLACE FUNCTION add_payment_to_reservation(
  p_reservation_id UUID,
  p_amount DECIMAL(10, 2),
  p_payment_method payment_method,
  p_user_id UUID,
  p_company_id UUID
) RETURNS jsonb AS $$
DECLARE
  v_total_amount DECIMAL(10, 2);
  v_amount_paid DECIMAL(10, 2);
  v_new_total_paid DECIMAL(10, 2);
  v_reservation_status reservation_status;
BEGIN
  -- 1. Obtener total de la reserva
  SELECT total_amount, status 
  INTO v_total_amount, v_reservation_status 
  FROM reservations 
  WHERE id = p_reservation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reserva no encontrada con ID: %', p_reservation_id;
  END IF;
  
  -- Validar que no esté cancelada
  IF v_reservation_status = 'cancelled' THEN
    RAISE EXCEPTION 'No se puede agregar pago a una reserva cancelada';
  END IF;
  
  -- Validar monto positivo
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'El monto del pago debe ser mayor a 0';
  END IF;
  
  -- 2. Calcular monto ya pagado
  SELECT COALESCE(SUM(amount), 0) 
  INTO v_amount_paid
  FROM transactions 
  WHERE source_id = p_reservation_id 
    AND source_type = 'reservation' 
    AND type = 'ticket';
  
  v_new_total_paid := v_amount_paid + p_amount;
  
  -- 3. Validar que no exceda el total
  IF v_new_total_paid > v_total_amount THEN
    RAISE EXCEPTION 'El pago excede el total. Pagado: $%, Total: $%, Exceso: $%', 
      v_new_total_paid, v_total_amount, (v_new_total_paid - v_total_amount);
  END IF;
  
  -- 4. Crear transacción SIN box_cutoff_id
  --    (se asignará cuando se haga el corte de caja)
  INSERT INTO transactions (
    source_type, 
    source_id, 
    type, 
    amount, 
    payment_method, 
    user_id, 
    company_id, 
    box_cutoff_id,
    notes,
    created_at
  )
  VALUES (
    'reservation', 
    p_reservation_id, 
    'ticket', 
    p_amount, 
    p_payment_method, 
    p_user_id, 
    p_company_id, 
    NULL,  -- Sin corte aún
    'Pago adicional de reserva',
    NOW()
  );
  
  -- 5. Actualizar payment_status de la reserva
  UPDATE reservations
  SET 
    payment_status = CASE 
      WHEN v_new_total_paid >= v_total_amount THEN 'paid'::payment_status
      WHEN v_new_total_paid > 0 THEN 'paid'::payment_status  -- Consideramos "paid" aunque sea parcial
      ELSE 'pending'::payment_status
    END,
    updated_at = NOW()
  WHERE id = p_reservation_id;
  
  -- 6. Audit log
  INSERT INTO audit_logs (
    table_name, 
    record_id, 
    action_type, 
    user_id, 
    old_data,
    new_data
  )
  VALUES (
    'reservations', 
    p_reservation_id, 
    'update', 
    p_user_id, 
    jsonb_build_object(
      'payment_status', v_payment_status
    ),
    jsonb_build_object(
      'payment_added', p_amount,
      'payment_method', p_payment_method,
      'total_paid', v_new_total_paid
    )
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'total_paid', v_new_total_paid, 
    'remaining', v_total_amount - v_new_total_paid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIN DE FUNCIONES
-- =====================================================

-- NOTAS DE USO:
--
-- 1. Obtener saldo en caja:
--    SELECT get_user_cash_balance('user-uuid', 'company-uuid');
--
-- 2. Cancelar con reembolso:
--    SELECT cancel_reservation_with_refund(
--      'reservation-uuid',
--      'user-uuid',
--      100.50,
--      'Cliente solicitó cancelación',
--      'cash'
--    );
--
-- 3. Cancelar sin reembolso:
--    SELECT cancel_reservation_with_refund(
--      'reservation-uuid',
--      'user-uuid',
--      0,  -- Sin reembolso
--      'No-show del cliente',
--      'cash'
--    );
--
-- 4. Modificar viaje:
--    SELECT modify_reservation_trip(
--      'reservation-uuid',
--      'new-trip-segment-uuid',
--      'user-uuid'
--    );
--
-- 5. Agregar pago:
--    SELECT add_payment_to_reservation(
--      'reservation-uuid',
--      250.00,
--      'transfer',
--      'user-uuid',
--      'company-uuid'
--    );
--
-- IMPORTANTE: Todas estas funciones dependen del trigger
-- update_trip_segment_availability() para la gestión de asientos.

