-- TransRoute Database Seed Data
-- Sample data for testing and development

-- Insert sample company
INSERT INTO companies (id, name, legal_name, email, phone, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'TransRoute Demo', 'TransRoute Demo S.A. de C.V.', 'demo@transroute.com', '+52 123 456 7890', true);

-- Insert sample users
INSERT INTO users (id, first_name, last_name, email, password_hash, role, phone, company_id, is_active)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Super', 'Admin', 'superadmin@transroute.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', 'super_admin', '+52 111 111 1111', NULL, true),
  ('33333333-3333-3333-3333-333333333333', 'Owner', 'Demo', 'owner@transroute.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', 'owner', '+52 222 222 2222', '11111111-1111-1111-1111-111111111111', true),
  ('44444444-4444-4444-4444-444444444444', 'Admin', 'User', 'admin@transroute.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', 'admin', '+52 333 333 3333', '11111111-1111-1111-1111-111111111111', true),
  ('55555555-5555-5555-5555-555555555555', 'Cashier', 'One', 'cashier@transroute.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', 'cashier', '+52 444 444 4444', '11111111-1111-1111-1111-111111111111', true),
  ('66666666-6666-6666-6666-666666666666', 'Driver', 'One', 'driver@transroute.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', 'driver', '+52 555 555 5555', '11111111-1111-1111-1111-111111111111', true);

-- Link users to companies
INSERT INTO user_companies (user_id, company_id)
VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111');

-- Insert sample routes
INSERT INTO routes (id, name, origin, destination, stops, distance_km, estimated_duration_minutes, company_id, is_active)
VALUES
  ('77777777-7777-7777-7777-777777777777', 'México - Guadalajara', 'Ciudad de México', 'Guadalajara', ARRAY['Querétaro', 'León'], 550.00, 420, '11111111-1111-1111-1111-111111111111', true),
  ('88888888-8888-8888-8888-888888888888', 'Guadalajara - Monterrey', 'Guadalajara', 'Monterrey', ARRAY['Aguascalientes', 'Zacatecas'], 780.00, 540, '11111111-1111-1111-1111-111111111111', true);

-- Insert sample vehicles
INSERT INTO vehicles (id, plates, brand, model, year, economic_number, capacity, has_ac, has_reclining_seats, services, company_id, is_active)
VALUES
  ('99999999-9999-9999-9999-999999999999', 'ABC-123-XY', 'Mercedes-Benz', 'Sprinter', 2022, 'VEH-001', 20, true, true, ARRAY['WiFi', 'Pantalla', 'USB'], '11111111-1111-1111-1111-111111111111', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'XYZ-456-AB', 'Volvo', '9700', 2021, 'VEH-002', 45, true, true, ARRAY['WiFi', 'Baño', 'Pantalla'], '11111111-1111-1111-1111-111111111111', true);

-- Insert sample clients
INSERT INTO clients (id, first_name, last_name, email, phone, company_id)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Juan', 'Pérez', 'juan.perez@example.com', '+52 777 777 7777', '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'María', 'González', 'maria.gonzalez@example.com', '+52 888 888 8888', '11111111-1111-1111-1111-111111111111');

-- Insert sample commissions
INSERT INTO commissions (id, name, description, amount, is_percentage, company_id, is_active)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Comisión Venta', 'Comisión por venta de boleto', 5.00, true, '11111111-1111-1111-1111-111111111111', true);

