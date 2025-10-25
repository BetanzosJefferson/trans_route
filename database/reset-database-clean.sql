-- =====================================================
-- Script para LIMPIAR TODA LA BASE DE DATOS
-- =====================================================
-- ⚠️  ADVERTENCIA: Este script ELIMINARÁ TODOS LOS DATOS
-- ⚠️  Mantiene la estructura de tablas pero borra contenido
-- ⚠️  Ejecutar solo si estás seguro de empezar desde cero
-- =====================================================

BEGIN;

-- =====================================================
-- PASO 1: Deshabilitar triggers temporalmente
-- =====================================================
SET session_replication_role = replica;

-- =====================================================
-- PASO 2: Eliminar datos de tablas dependientes primero
-- =====================================================

-- Transacciones y finanzas
DELETE FROM transactions;
DELETE FROM commissions;
DELETE FROM expenses;

-- Reservaciones y pasajeros
DELETE FROM passengers;
DELETE FROM reservations;

-- Paquetes
DELETE FROM packages;

-- Viajes y segmentos
DELETE FROM trip_segments;
DELETE FROM trips;

-- Rutas y plantillas
DELETE FROM route_templates;
DELETE FROM routes;

-- Stops (nueva tabla)
DELETE FROM stops;

-- Vehículos y choferes
DELETE FROM vehicles;

-- Clientes
DELETE FROM clients;

-- Notificaciones
DELETE FROM notifications;

-- Audit logs
DELETE FROM audit_logs;

-- Invitaciones
DELETE FROM invitations;

-- Box cutoffs
DELETE FROM box_cutoffs;

-- Usuarios (mantener admin)
-- NO eliminar usuarios para mantener acceso

-- =====================================================
-- PASO 3: Resetear secuencias/contadores si existen
-- =====================================================
-- (Si tienes secuencias SERIAL, agregar aquí)

-- =====================================================
-- PASO 4: Re-habilitar triggers
-- =====================================================
SET session_replication_role = DEFAULT;

-- =====================================================
-- PASO 5: Verificar limpieza
-- =====================================================
SELECT 
  'reservations' as tabla, COUNT(*) as registros FROM reservations
UNION ALL
SELECT 'trip_segments', COUNT(*) FROM trip_segments
UNION ALL
SELECT 'trips', COUNT(*) FROM trips
UNION ALL
SELECT 'routes', COUNT(*) FROM routes
UNION ALL
SELECT 'route_templates', COUNT(*) FROM route_templates
UNION ALL
SELECT 'stops', COUNT(*) FROM stops
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'packages', COUNT(*) FROM packages
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- =====================================================
-- PASO 6: Verificar estructura de stops
-- =====================================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('stops', 'trip_segments', 'routes', 'packages')
  AND column_name LIKE '%stop%'
ORDER BY table_name, ordinal_position;

COMMIT;

-- =====================================================
-- ✅ BASE DE DATOS LIMPIA
-- =====================================================
-- Ahora puedes:
-- 1. Crear nuevas rutas usando SOLO IDs de stops
-- 2. Publicar viajes que generen trip_segments con stop_ids
-- 3. Hacer reservas usando búsquedas por IDs
--
-- Sin datos legacy, sin búsquedas por strings
-- =====================================================

