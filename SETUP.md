# 🚀 Setup Rápido de TransRoute

## Paso 1️⃣: Crear Proyecto en Supabase (2 minutos)

1. Ve a https://supabase.com/dashboard
2. Click en "New Project"
3. Completa:
   - Name: `transroute`
   - Database Password: (guárdala)
   - Region: Selecciona la más cercana
4. Click "Create new project" y espera ~2 minutos

## Paso 2️⃣: Ejecutar Scripts SQL

Una vez creado el proyecto:

1. En el dashboard de Supabase, ve a **SQL Editor** (icono de consola en el menú izquierdo)
2. Click en "New Query"
3. Copia y pega TODO el contenido de `database/schema.sql`
4. Click en "Run" (o presiona Ctrl/Cmd + Enter)
5. Repite con `database/seed.sql` (opcional, para datos de prueba)

## Paso 3️⃣: Obtener Credenciales

En tu proyecto de Supabase:

1. Ve a **Settings** (⚙️) → **API**
2. Copia estos valores:

```
Project URL: https://xxx.supabase.co
anon/public key: eyJhbGc...
service_role key: eyJhbGc... (click en "Reveal" para verla)
```

## Paso 4️⃣: Configurar Backend

Pega tus credenciales en `backend/.env`:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

SUPABASE_URL=PEGA_TU_PROJECT_URL_AQUI
SUPABASE_ANON_KEY=PEGA_TU_ANON_KEY_AQUI
SUPABASE_SERVICE_KEY=PEGA_TU_SERVICE_KEY_AQUI

JWT_SECRET=mi-super-secreto-jwt-2025
JWT_EXPIRATION=7d

CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=debug
```

## Paso 5️⃣: Configurar Frontend

Pega tus credenciales en `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=PEGA_TU_PROJECT_URL_AQUI
NEXT_PUBLIC_SUPABASE_ANON_KEY=PEGA_TU_ANON_KEY_AQUI
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## ✅ ¡Listo!

Los scripts ya están instalando y ejecutando todo. 

**Accede a:**
- 🎨 Frontend: http://localhost:3001
- 🔧 Backend API: http://localhost:3000/api/v1
- 📚 Swagger Docs: http://localhost:3000/api/docs

**Usuario de prueba:**
- Email: `owner@transroute.com`
- Password: `password123` (cámbiala después)

---

## 🔧 Si algo falla:

**Backend no inicia:**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend no inicia:**
```bash
cd frontend
npm install
npm run dev
```

**Error de conexión a DB:**
- Verifica que las credenciales en los archivos .env sean correctas
- Verifica que ejecutaste los SQL scripts en Supabase

