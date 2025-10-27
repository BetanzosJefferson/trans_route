-- =====================================================
-- FIX: Función add_payment_to_reservation
-- Corrige cálculo de amount_paid y payment_status
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
  v_old_payment_status payment_status;
BEGIN
  -- 1. Obtener total de la reserva
  SELECT total_amount, status, payment_status 
  INTO v_total_amount, v_reservation_status, v_old_payment_status
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
  
  -- 2. Calcular monto ya pagado (incluir ticket_deposit y restar refunds)
  SELECT COALESCE(SUM(
    CASE 
      WHEN type IN ('ticket','ticket_deposit') THEN amount
      WHEN type = 'refund' THEN -amount
      ELSE 0
    END
  ), 0)
  INTO v_amount_paid
  FROM transactions 
  WHERE source_id = p_reservation_id 
    AND source_type = 'reservation';
  
  v_new_total_paid := v_amount_paid + p_amount;
  
  -- 3. Validar que no exceda el total
  IF v_new_total_paid > v_total_amount THEN
    RAISE EXCEPTION 'El pago excede el total. Pagado: $%, Total: $%, Exceso: $%', 
      v_new_total_paid, v_total_amount, (v_new_total_paid - v_total_amount);
  END IF;
  
  -- 4. Crear transacción SIN box_cutoff_id
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
    NULL,
    'Pago adicional de reserva',
    NOW()
  );
  
  -- 5. Actualizar payment_status de la reserva
  UPDATE reservations
  SET 
    payment_status = CASE 
      WHEN v_new_total_paid >= v_total_amount THEN 'paid'::payment_status
      WHEN v_new_total_paid > 0 THEN 'partial'::payment_status
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
      'payment_status', v_old_payment_status,
      'previous_total_paid', v_amount_paid
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

