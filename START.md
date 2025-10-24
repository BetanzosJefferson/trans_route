# 🚀 INICIO RÁPIDO - TransRoute

## ⚡ Opción 1: Script Automático (Recomendado)

### Paso 1: Crear proyecto en Supabase (2 minutos)

1. Ve a: https://supabase.com/dashboard
2. Click "New Project"
3. Nombre: `transroute`
4. Contraseña: (guárdala)
5. Región: Selecciona la más cercana
6. Click "Create" y espera ~2 minutos

### Paso 2: Ejecutar Scripts SQL

En Supabase Dashboard:
1. Ve a **SQL Editor** (icono de consola)
2. Click "New Query"
3. Copia TODO el contenido de `database/schema.sql`
4. Click "Run" (Ctrl/Cmd + Enter)
5. Repite con `database/seed.sql`

### Paso 3: Ejecutar Setup

Abre una terminal en esta carpeta y ejecuta:

```bash
./setup.sh
```

El script te pedirá tus credenciales de Supabase y:
- ✅ Creará los archivos .env automáticamente
- ✅ Instalará todas las dependencias
- ✅ Iniciará backend y frontend
- ✅ Abrirá los servidores en nuevas terminales

---

## 🔧 Opción 2: Manual (si el script falla)

### Paso 1 y 2: Igual que arriba ☝️

### Paso 3: Configurar Backend

1. Copia el archivo de ejemplo:
```bash
cd backend
cp .env.example .env
```

2. Edita `backend/.env` con tus credenciales de Supabase:
   - Ve a Supabase → Settings → API
   - Copia Project URL, anon key y service_role key

3. Instala dependencias:
```bash
npm install
```

4. Inicia el backend:
```bash
npm run start:dev
```

### Paso 4: Configurar Frontend

En una **NUEVA TERMINAL**:

1. Copia el archivo de ejemplo:
```bash
cd frontend
cp .env.local.example .env.local
```

2. Edita `frontend/.env.local` con tus credenciales

3. Instala dependencias:
```bash
npm install
```

4. Inicia el frontend:
```bash
npm run dev
```

---

## 🎉 ¡Listo para usar!

Accede a:
- **🎨 Frontend:** http://localhost:3001
- **🔧 Backend API:** http://localhost:3000/api/v1
- **📚 Swagger Docs:** http://localhost:3000/api/docs

### 👤 Usuario de Prueba

Si ejecutaste `seed.sql`:

```
Email: owner@transroute.com
Password: password123
```

---

## ❌ Solución de Problemas

### Error: npm EPERM

```bash
sudo chown -R $(whoami) ~/.npm
```

### Backend no inicia

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run start:dev
```

### Frontend no inicia

```bash
cd frontend
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### Error de conexión a Supabase

- Verifica que las credenciales en `.env` sean correctas
- Verifica que ejecutaste los SQL scripts
- Asegúrate que el proyecto de Supabase esté activo

---

## 📝 Notas Importantes

1. **Backend** debe estar corriendo en http://localhost:3000
2. **Frontend** debe estar corriendo en http://localhost:3001
3. Ambos deben estar corriendo simultáneamente
4. Los archivos `.env` NO se suben a git (son secretos)

---

## 🆘 Necesitas Ayuda?

1. Lee `README.md` para documentación completa
2. Revisa `DEPLOYMENT.md` para deployment
3. Consulta los logs en las terminales
4. Revisa que Supabase esté configurado correctamente

