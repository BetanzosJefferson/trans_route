-- ========================================
-- PARTE 2: RESTO DEL SCHEMA
-- ========================================
-- IMPORTANTE: Ejecutar DESPUÉS de PART1

-- ========================================
-- AGREGAR CAMPOS A RESERVATIONS
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservations' AND column_name='amount_paid') THEN
    ALTER TABLE reservations ADD COLUMN amount_paid DECIMAL(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservations' AND column_name='amount_pending') THEN
    ALTER TABLE reservations ADD COLUMN amount_pending DECIMAL(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservations' AND column_name='extra_charges') THEN
    ALTER TABLE reservations ADD COLUMN extra_charges DECIMAL(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservations' AND column_name='extra_charges_reason') THEN
    ALTER TABLE reservations ADD COLUMN extra_charges_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservations' AND column_name='refund_amount') THEN
    ALTER TABLE reservations ADD COLUMN refund_amount DECIMAL(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservations' AND column_name='cancellation_reason') THEN
    ALTER TABLE reservations ADD COLUMN cancellation_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservations' AND column_name='cancelled_at') THEN
    ALTER TABLE reservations ADD COLUMN cancelled_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservations' AND column_name='no_show_at') THEN
    ALTER TABLE reservations ADD COLUMN no_show_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservations' AND column_name='parent_reservation_id') THEN
    ALTER TABLE reservations ADD COLUMN parent_reservation_id UUID REFERENCES reservations(id);
  END IF;
END $$;

-- Índices
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reservations_amount_pending') THEN
    CREATE INDEX idx_reservations_amount_pending ON reservations(amount_pending) WHERE amount_pending > 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reservations_parent') THEN
    CREATE INDEX idx_reservations_parent ON reservations(parent_reservation_id);
  END IF;
END $$;

-- ========================================
-- TABLA DE HISTORIAL
-- ========================================

CREATE TABLE IF NOT EXISTS reservation_modifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  modification_type modification_type NOT NULL,
  old_data JSONB NOT NULL,
  new_data JSONB NOT NULL,
  reason TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_res_mods_reservation') THEN
    CREATE INDEX idx_res_mods_reservation ON reservation_modifications(reservation_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_res_mods_created') THEN
    CREATE INDEX idx_res_mods_created ON reservation_modifications(created_at);
  END IF;
END $$;

-- ========================================
-- FUNCIONES DE VALIDACIÓN
-- ========================================

CREATE OR REPLACE FUNCTION validate_payment_integrity()
RETURNS TRIGGER AS $$
DECLARE
  transaction_count INT;
  total_paid DECIMAL(10,2);
BEGIN
  IF NEW.payment_status IN ('paid', 'partial') THEN
    SELECT COUNT(*), COALESCE(SUM(amount), 0)
    INTO transaction_count, total_paid
    FROM transactions
    WHERE source_type = 'reservation'
      AND source_id = NEW.id
      AND type IN ('ticket', 'ticket_deposit');
    
    IF transaction_count = 0 THEN
      RAISE EXCEPTION 'FRAUDE DETECTADO: Reserva % con payment_status=% pero SIN transacciones', 
        NEW.id, NEW.payment_status;
    END IF;
    
    IF NEW.payment_status = 'paid' AND total_paid < NEW.total_amount THEN
      RAISE EXCEPTION 'INCONSISTENCIA: Reserva % marcada como "paid" pero solo tiene $% en transacciones (debe tener $%)',
        NEW.id, total_paid, NEW.total_amount;
    END IF;
    
    IF NEW.payment_status = 'partial' AND total_paid != NEW.amount_paid THEN
      RAISE EXCEPTION 'INCONSISTENCIA: Reserva % tiene amount_paid=$% pero transacciones suman $%',
        NEW.id, NEW.amount_paid, total_paid;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_transaction_deletion()
RETURNS TRIGGER AS $$
DECLARE
  reservation_status TEXT;
  package_status TEXT;
BEGIN
  IF OLD.source_type = 'reservation' THEN
    SELECT status INTO reservation_status
    FROM reservations
    WHERE id = OLD.source_id;
    
    IF reservation_status IN ('confirmed', 'modified') THEN
      RAISE EXCEPTION 'NO SE PUEDE ELIMINAR: Transacción % está asociada a reserva activa %',
        OLD.id, OLD.source_id;
    END IF;
  ELSIF OLD.source_type = 'package' THEN
    SELECT status INTO package_status
    FROM packages
    WHERE id = OLD.source_id;
    
    IF package_status IN ('pending', 'in_transit') THEN
      RAISE EXCEPTION 'NO SE PUEDE ELIMINAR: Transacción % está asociada a paquete activo %',
        OLD.id, OLD.source_id;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_trip_segment_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE trip_segments
    SET available_seats = available_seats - NEW.seats_reserved
    WHERE id = NEW.trip_segment_id
      AND available_seats >= NEW.seats_reserved;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No hay suficientes asientos disponibles en el segmento';
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.seats_reserved != OLD.seats_reserved OR NEW.trip_segment_id != OLD.trip_segment_id THEN
      
      IF NEW.trip_segment_id != OLD.trip_segment_id THEN
        UPDATE trip_segments
        SET available_seats = available_seats + OLD.seats_reserved
        WHERE id = OLD.trip_segment_id;
        
        UPDATE trip_segments
        SET available_seats = available_seats - NEW.seats_reserved
        WHERE id = NEW.trip_segment_id
          AND available_seats >= NEW.seats_reserved;
      ELSE
        UPDATE trip_segments
        SET available_seats = available_seats + (OLD.seats_reserved - NEW.seats_reserved)
        WHERE id = NEW.trip_segment_id;
      END IF;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.cancelled_at IS NULL THEN
      UPDATE trip_segments
      SET available_seats = available_seats + OLD.seats_reserved
      WHERE id = OLD.trip_segment_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
  
  INSERT INTO reservations (
    client_id,
    trip_segment_id,
    seats_reserved,
    total_amount,
    payment_status,
    amount_paid,
    amount_pending,
    company_id,
    created_by_user_id,
    status,
    notes
  ) VALUES (
    p_client_id,
    p_trip_segment_id,
    p_seats_reserved,
    p_total_amount,
    'pending',
    0,
    p_total_amount,
    p_company_id,
    p_user_id,
    'confirmed',
    p_notes
  ) RETURNING id INTO v_reservation_id;
  
  IF p_payment_status IN ('paid', 'partial') AND p_amount_paid > 0 THEN
    INSERT INTO transactions (
      source_type,
      source_id,
      type,
      amount,
      payment_method,
      user_id,
      company_id
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
      p_company_id
    ) RETURNING id INTO v_transaction_id;
    
    UPDATE reservations
    SET 
      payment_status = p_payment_status,
      amount_paid = p_amount_paid,
      amount_pending = p_total_amount - p_amount_paid
    WHERE id = v_reservation_id;
  END IF;
  
  RETURN jsonb_build_object(
    'reservation_id', v_reservation_id,
    'transaction_id', v_transaction_id,
    'success', true
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error en transacción: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

DROP TRIGGER IF EXISTS trg_validate_payment_integrity ON reservations;
CREATE TRIGGER trg_validate_payment_integrity
BEFORE UPDATE OF payment_status ON reservations
FOR EACH ROW
WHEN (NEW.payment_status != OLD.payment_status)
EXECUTE FUNCTION validate_payment_integrity();

DROP TRIGGER IF EXISTS trg_prevent_transaction_deletion ON transactions;
CREATE TRIGGER trg_prevent_transaction_deletion
BEFORE DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION prevent_transaction_deletion();

DROP TRIGGER IF EXISTS trg_reservation_availability ON reservations;
CREATE TRIGGER trg_reservation_availability
AFTER INSERT OR UPDATE OR DELETE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_trip_segment_availability();

-- ========================================
-- VISTAS DE AUDITORÍA
-- ========================================

CREATE OR REPLACE VIEW v_orphaned_reservations AS
SELECT 
  r.id,
  r.company_id,
  r.payment_status,
  r.total_amount,
  r.amount_paid,
  r.created_at,
  r.created_by_user_id,
  COUNT(t.id) as transaction_count,
  COALESCE(SUM(t.amount), 0) as total_in_transactions,
  'HUÉRFANA: Sin transacciones' as issue_type
FROM reservations r
LEFT JOIN transactions t ON t.source_type = 'reservation' 
  AND t.source_id = r.id
  AND t.type IN ('ticket', 'ticket_deposit')
WHERE r.payment_status IN ('paid', 'partial')
  AND r.deleted_at IS NULL
GROUP BY r.id, r.company_id, r.payment_status, r.total_amount, r.amount_paid, r.created_at, r.created_by_user_id
HAVING COUNT(t.id) = 0;

CREATE OR REPLACE VIEW v_mismatched_payments AS
SELECT 
  r.id,
  r.company_id,
  r.payment_status,
  r.total_amount,
  r.amount_paid,
  COALESCE(SUM(t.amount), 0) as total_in_transactions,
  r.total_amount - COALESCE(SUM(t.amount), 0) as difference,
  'DESCUADRE: Montos no coinciden' as issue_type
FROM reservations r
LEFT JOIN transactions t ON t.source_type = 'reservation' 
  AND t.source_id = r.id
  AND t.type IN ('ticket', 'ticket_deposit', 'refund')
WHERE r.payment_status IN ('paid', 'partial')
  AND r.deleted_at IS NULL
GROUP BY r.id, r.total_amount, r.amount_paid, r.payment_status, r.company_id
HAVING 
  (r.payment_status = 'paid' AND COALESCE(SUM(t.amount), 0) < r.total_amount) OR
  (r.payment_status = 'partial' AND COALESCE(SUM(t.amount), 0) != r.amount_paid);

CREATE OR REPLACE FUNCTION check_financial_integrity()
RETURNS TABLE(
  issue_type TEXT,
  count BIGINT,
  total_amount DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Reservas Huérfanas'::TEXT as issue_type,
    COUNT(*)::BIGINT,
    COALESCE(SUM(v.total_amount), 0)::DECIMAL(10,2)
  FROM v_orphaned_reservations v
  
  UNION ALL
  
  SELECT 
    'Pagos Descuadrados'::TEXT as issue_type,
    COUNT(*)::BIGINT,
    COALESCE(SUM(ABS(v.difference)), 0)::DECIMAL(10,2)
  FROM v_mismatched_payments v;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FIN
-- ========================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Schema de reservaciones mejorado exitosamente';
  RAISE NOTICE '✅ Sistema anti-fraude activado';
  RAISE NOTICE '✅ Gestión por tramos habilitada';
  RAISE NOTICE '✅ Trazabilidad completa configurada';
END $$;

