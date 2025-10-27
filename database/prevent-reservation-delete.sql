-- =====================================================
-- TRIGGER: Prevenir eliminación directa de reservaciones
-- Las reservaciones solo se pueden cancelar, no eliminar
-- =====================================================

CREATE OR REPLACE FUNCTION prevent_reservation_delete()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Las reservaciones no se pueden eliminar directamente. Use la función de cancelación en su lugar.';
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trg_prevent_reservation_delete ON reservations;

-- Crear trigger
CREATE TRIGGER trg_prevent_reservation_delete
BEFORE DELETE ON reservations
FOR EACH ROW
EXECUTE FUNCTION prevent_reservation_delete();

