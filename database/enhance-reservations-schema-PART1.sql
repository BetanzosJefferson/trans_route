-- ========================================
-- PARTE 1: AMPLIAR ENUMs
-- ========================================
-- IMPORTANTE: Ejecutar PRIMERO, solo esto
-- Luego ejecutar PART2

-- Ampliar estados de reserva (si no existen)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_confirmation' AND enumtypid = 'reservation_status'::regtype) THEN
    ALTER TYPE reservation_status ADD VALUE 'pending_confirmation';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ya existe
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'no_show' AND enumtypid = 'reservation_status'::regtype) THEN
    ALTER TYPE reservation_status ADD VALUE 'no_show';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'modified' AND enumtypid = 'reservation_status'::regtype) THEN
    ALTER TYPE reservation_status ADD VALUE 'modified';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Ampliar estados de pago (si no existen)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'partial' AND enumtypid = 'payment_status'::regtype) THEN
    ALTER TYPE payment_status ADD VALUE 'partial';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'refunded' AND enumtypid = 'payment_status'::regtype) THEN
    ALTER TYPE payment_status ADD VALUE 'refunded';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'refund_pending' AND enumtypid = 'payment_status'::regtype) THEN
    ALTER TYPE payment_status ADD VALUE 'refund_pending';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Crear tipo para modificaciones (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'modification_type') THEN
    CREATE TYPE modification_type AS ENUM (
      'date_change',
      'time_change',
      'seat_reduction',
      'seat_increase',
      'price_adjustment',
      'cancellation',
      'split_reservation'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Mensaje
DO $$ 
BEGIN
  RAISE NOTICE '✅ PARTE 1 COMPLETADA: ENUMs creados';
  RAISE NOTICE '⏭️  AHORA EJECUTA: enhance-reservations-schema-PART2.sql';
END $$;

