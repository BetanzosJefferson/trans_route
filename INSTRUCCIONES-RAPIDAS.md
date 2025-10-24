# ⚡ INSTRUCCIONES RÁPIDAS

## 🎯 Objetivo: Tener TransRoute funcionando en 10 minutos

---

## 📋 Checklist Completo

### ✅ PASO 1: Supabase (3 minutos)

1. [ ] Ir a https://supabase.com/dashboard
2. [ ] Click "New Project" 
3. [ ] Completar:
   - Nombre: `transroute`
   - Contraseña: (anótala)
   - Región: South America (o la más cercana)
4. [ ] Click "Create new project"
5. [ ] ⏰ Esperar 2 minutos mientras se crea

### ✅ PASO 2: Ejecutar SQL (2 minutos)

1. [ ] En Supabase Dashboard → **SQL Editor** (icono </> en menú izquierdo)
2. [ ] Click "New Query"
3. [ ] Abrir archivo `database/schema.sql` en tu editor
4. [ ] Copiar TODO el contenido
5. [ ] Pegar en SQL Editor de Supabase
6. [ ] Click "Run" (o presionar Cmd+Enter)
7. [ ] ✅ Debe decir "Success. No rows returned"
8. [ ] Repetir con `database/seed.sql`:
   - New Query → Copiar contenido → Pegar → Run

### ✅ PASO 3: Obtener Credenciales (1 minuto)

1. [ ] En Supabase → **Settings** ⚙️ → **API**
2. [ ] Copiar y guardar:

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGc....
service_role: eyJhbGc.... (click "Reveal" primero)
```

### ✅ PASO 4: Configurar Backend (2 minutos)

Abre una **Terminal** y ejecuta:

```bash
cd /Users/williambe/Documents/transroute/backend

# Copiar archivo de configuración
cp .env.example .env

# Abrir archivo para editar
nano .env
```

Reemplazar estas líneas con tus credenciales:
```
SUPABASE_URL=PEGA_TU_PROJECT_URL
SUPABASE_ANON_KEY=PEGA_TU_ANON_KEY  
SUPABASE_SERVICE_KEY=PEGA_TU_SERVICE_KEY
```

Presionar `Ctrl+X` → `Y` → `Enter` para guardar

Luego:
```bash
# Instalar dependencias
npm install

# Iniciar backend
npm run start:dev
```

✅ Debe decir: "TransRoute API running on: http://localhost:3000/api/v1"

### ✅ PASO 5: Configurar Frontend (2 minutos)

Abre una **NUEVA Terminal** (la anterior debe seguir corriendo) y ejecuta:

```bash
cd /Users/williambe/Documents/transroute/frontend

# Copiar archivo de configuración
cp .env.local.example .env.local

# Abrir archivo para editar
nano .env.local
```

Reemplazar con tus credenciales:
```
NEXT_PUBLIC_SUPABASE_URL=PEGA_TU_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=PEGA_TU_ANON_KEY
```

Presionar `Ctrl+X` → `Y` → `Enter` para guardar

Luego:
```bash
# Instalar dependencias
npm install

# Iniciar frontend
npm run dev
```

✅ Debe decir: "Ready started server on 0.0.0.0:3001"

---

## 🎉 ¡LISTO!

### Abre tu navegador en:

**👉 http://localhost:3001 👈**

### Inicia sesión con:
```
Email: owner@transroute.com
Password: password123
```

---

## 🖼️ Lo que deberías ver:

1. **Landing Page** con botones de Login/Registro
2. Al hacer login → **Dashboard** con estadísticas
3. Menú lateral en desktop
4. Bottom navigation en móvil
5. Botón de modo oscuro en header

---

## ⚠️ Si algo falla:

### Error: "EADDRINUSE"
El puerto está ocupado. Matar proceso:
```bash
# Para puerto 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Para puerto 3001 (frontend)  
lsof -ti:3001 | xargs kill -9
```

### Error: "Cannot connect to Supabase"
- Verifica que las credenciales en `.env` sean correctas (sin espacios)
- Asegúrate que ejecutaste los SQL scripts
- Verifica que tu proyecto de Supabase esté activo

### Error: "Module not found"
```bash
# Backend
cd backend && rm -rf node_modules && npm install

# Frontend
cd frontend && rm -rf node_modules .next && npm install
```

---

## 📱 Extras

### Ver logs del backend:
Revisa la terminal donde ejecutaste `npm run start:dev`

### Ver documentación de la API:
http://localhost:3000/api/docs

### Detener los servidores:
Presiona `Ctrl+C` en cada terminal

### Reiniciar:
```bash
# Backend
cd backend && npm run start:dev

# Frontend (en otra terminal)
cd frontend && npm run dev
```

---

## 🎯 ¿Todo funcionando?

Ahora puedes:
- ✅ Explorar el dashboard
- ✅ Crear viajes
- ✅ Hacer reservaciones
- ✅ Ver reportes
- ✅ Gestionar usuarios
- ✅ Y mucho más!

**¡Disfruta TransRoute! 🚀**

