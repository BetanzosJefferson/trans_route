-- =====================================================
-- MIGRACIÓN: Sistema de Gestión de Reservaciones
-- Fecha: 2025-10-26
-- Descripción: Extensiones de schema para gestión completa
--              de reservaciones (cancelaciones, check-in, 
--              transferencias, pagos mixtos)
-- =====================================================

-- 1. EXTENSIÓN DE TABLA RESERVATIONS
-- =====================================================

ALTER TABLE reservations 
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_in_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_no_show BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_show_marked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS transferred_to_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS transfer_notes TEXT;

-- 2. NUEVA TABLA: LOCAL_TRANSFER_COMPANIES
-- =====================================================
-- Para transferencias a empresas no registradas en Transroute

CREATE TABLE IF NOT EXISTS local_transfer_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice para check-in rápido
CREATE INDEX IF NOT EXISTS idx_reservations_checked_in 
  ON reservations(checked_in_at) 
  WHERE checked_in_at IS NOT NULL;

-- Índice para no-shows
CREATE INDEX IF NOT EXISTS idx_reservations_no_show 
  ON reservations(is_no_show) 
  WHERE is_no_show = true;

-- Índice para transacciones sin corte (saldo en caja)
CREATE INDEX IF NOT EXISTS idx_transactions_unclosed 
  ON transactions(user_id, company_id) 
  WHERE box_cutoff_id IS NULL;

-- Índice para búsqueda de reservas por fecha de viaje
CREATE INDEX IF NOT EXISTS idx_reservations_trip_segment 
  ON reservations(trip_segment_id, status) 
  WHERE deleted_at IS NULL;

-- 4. ELIMINAR COLUMNA amount_paid SI EXISTE
-- =====================================================
-- Si existe, la eliminamos para evitar redundancia
-- El monto pagado se calculará dinámicamente en la vista
-- CASCADE elimina automáticamente las vistas dependientes

ALTER TABLE reservations DROP COLUMN IF EXISTS amount_paid CASCADE;

-- 5. VISTA: RESERVATIONS_WITH_AMOUNTS
-- =====================================================
-- Vista que calcula automáticamente amount_paid y payment_methods
-- Evita redundancia en la tabla

CREATE OR REPLACE VIEW reservations_with_amounts AS
SELECT 
  r.*,
  COALESCE(SUM(t.amount), 0) as amount_paid,
  ARRAY_AGG(DISTINCT t.payment_method) FILTER (WHERE t.payment_method IS NOT NULL) as payment_methods
FROM reservations r
LEFT JOIN transactions t 
  ON t.source_id = r.id 
  AND t.source_type = 'reservation' 
  AND t.type = 'ticket'
GROUP BY r.id;

-- 6. TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_local_transfer_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_local_transfer_companies_updated_at
  BEFORE UPDATE ON local_transfer_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_local_transfer_companies_updated_at();

-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE local_transfer_companies ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo pueden ver empresas de su compañía
CREATE POLICY local_transfer_companies_select_policy ON local_transfer_companies
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Los usuarios pueden insertar empresas de su compañía
CREATE POLICY local_transfer_companies_insert_policy ON local_transfer_companies
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Los usuarios pueden actualizar empresas de su compañía
CREATE POLICY local_transfer_companies_update_policy ON local_transfer_companies
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Los usuarios pueden eliminar empresas de su compañía
CREATE POLICY local_transfer_companies_delete_policy ON local_transfer_companies
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================

-- NOTAS IMPORTANTES:
-- 
-- 1. NO SE CREA TABLA user_cashbox
--    El saldo en caja se calcula desde transactions:
--    SUM(amount) WHERE box_cutoff_id IS NULL
--
-- 2. NO SE AGREGA amount_paid A reservations
--    Se calcula dinámicamente en la vista reservations_with_amounts
--
-- 3. NO SE AGREGA payment_method A reservations
--    Una reserva puede tener múltiples payment_methods (pagos mixtos)
--    Se obtiene de transactions asociadas
--
-- 4. El trigger update_trip_segment_availability ya maneja
--    la restauración de asientos al cancelar/modificar reservas
--
-- Para verificar la migración:
-- SELECT * FROM reservations LIMIT 1;
-- SELECT * FROM reservations_with_amounts LIMIT 1;
-- SELECT * FROM local_transfer_companies;

