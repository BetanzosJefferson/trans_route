-- =====================================================
-- FIX: Sincronizar payment_status con amounts reales
-- Corrige las inconsistencias en reservas existentes
-- =====================================================

UPDATE reservations r
SET payment_status = CASE
  WHEN s.total_paid >= r.total_amount THEN 'paid'::payment_status
  WHEN s.total_paid > 0 THEN 'partial'::payment_status
  ELSE 'pending'::payment_status
END
FROM (
  SELECT 
    r.id,
    COALESCE(SUM(CASE 
      WHEN t.type IN ('ticket','ticket_deposit') THEN t.amount
      WHEN t.type = 'refund' THEN -t.amount
      ELSE 0 
    END), 0) AS total_paid
  FROM reservations r
  LEFT JOIN transactions t 
    ON t.source_type='reservation' 
    AND t.source_id=r.id
  WHERE r.deleted_at IS NULL
  GROUP BY r.id
) s
WHERE r.id = s.id
  AND r.deleted_at IS NULL;

