# ⚡ EJECUTA ESTO AHORA EN SUPABASE

## 📝 Paso Final: Agregar Tabla de Invitaciones

### 1️⃣ Ve a Supabase SQL Editor

👉 https://supabase.com/dashboard

Abre tu proyecto → SQL Editor → New Query

### 2️⃣ Copia y Pega este SQL:

```sql
-- ============================================
-- INVITATIONS TABLE
-- ============================================
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  used_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_created_by ON invitations(created_by_user_id);
CREATE INDEX idx_invitations_is_used ON invitations(is_used);

-- Trigger para updated_at
CREATE TRIGGER update_invitations_updated_at 
  BEFORE UPDATE ON invitations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
```

### 3️⃣ Click en "Run" (Cmd+Enter)

✅ Debe decir "Success. No rows returned"

---

## 🎉 ¡Listo!

Una vez ejecutado el SQL, **recarga tu navegador** y:

### ✅ Como SuperAdmin podrás:

1. **Ver el menú "Invitaciones"** en el sidebar
2. **Crear invitaciones** para nuevas empresas
3. **Copiar enlaces únicos** de un solo uso
4. **Ver el estado** de cada invitación
5. **Eliminar invitaciones** no utilizadas

### ✅ Flujo completo:

1. SuperAdmin crea invitación
2. Copia enlace y lo envía a nueva empresa
3. Nuevo usuario abre enlace
4. Completa formulario con:
   - ✅ Datos de la empresa (nombre + logo)
   - ✅ Sus datos personales (nombre, email, contraseña, teléfono)
5. Se crea automáticamente:
   - ✅ La empresa en tabla `companies`
   - ✅ El usuario como `owner` en tabla `users`
   - ✅ La invitación se marca como usada
6. Usuario inicia sesión automáticamente

### ✅ Dashboard ahora muestra datos reales:

- ✅ Viajes de hoy (de la base de datos)
- ✅ Total de reservaciones (datos reales)
- ✅ Ingresos de hoy (calculados de transacciones)
- ✅ Próximos viajes (ordenados por fecha)
- ✅ Reservaciones recientes

---

## 🔗 URLs Importantes:

- **Dashboard:** http://localhost:3001/dashboard
- **Invitaciones:** http://localhost:3001/dashboard/invitations
- **API Docs:** http://localhost:3000/api/docs

---

## 👤 Para probar como SuperAdmin:

Primero necesitas crear un usuario SuperAdmin. 

**Opción 1: Modificar usuario existente en Supabase**

Ve a Supabase → Table Editor → users → Encuentra el usuario que creaste → Cambia el campo `role` a `super_admin`

**Opción 2: Crear SuperAdmin con SQL**

En Supabase SQL Editor:

```sql
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'TU_EMAIL_AQUI';
```

Luego cierra sesión y vuelve a entrar.

---

¡Después de ejecutar el SQL de invitations, ya tendrás el sistema completo funcionando! 🚀

