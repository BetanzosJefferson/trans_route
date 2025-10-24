# ▶️ EMPIEZA AQUÍ - TransRoute

## 🎯 TU MISIÓN: Ver TransRoute funcionando en tu navegador

---

## ⏱️ TIEMPO TOTAL: ~10 minutos

---

# 📍 PASO A PASO (NO TE SALTES NINGUNO)

## 1️⃣ CREAR PROYECTO EN SUPABASE (3 min)

### Abre tu navegador:
👉 https://supabase.com/dashboard

### Haz click en:
- ✅ "New Project"
- ✅ Nombre: `transroute`
- ✅ Contraseña: (anota esto: ______________)
- ✅ Región: "South America" o la más cercana
- ✅ Click "Create new project"
- ⏰ Espera 2 minutos...

---

## 2️⃣ EJECUTAR SCRIPTS DE BASE DE DATOS (2 min)

### En Supabase Dashboard:

1. **Click en el icono** </> (SQL Editor) en el menú izquierdo
2. **Click** "New Query"
3. **Abre** el archivo `/Users/williambe/Documents/transroute/database/schema.sql`
4. **Copia TODO** el contenido (Cmd+A, Cmd+C)
5. **Pega** en SQL Editor de Supabase (Cmd+V)
6. **Click** "Run" (o Cmd+Enter)
7. ✅ Debe aparecer "Success. No rows returned"

### Repite para los datos de prueba:

8. **Click** "New Query" otra vez
9. **Abre** el archivo `/Users/williambe/Documents/transroute/database/seed.sql`
10. **Copia TODO** y **Pega** en SQL Editor
11. **Click** "Run"
12. ✅ Debe aparecer "Success. No rows returned"

---

## 3️⃣ COPIAR TUS CREDENCIALES (1 min)

### En Supabase Dashboard:

1. **Click** en el icono ⚙️ (Settings) abajo a la izquierda
2. **Click** en "API"
3. **Copia estos valores** (los necesitarás en el siguiente paso):

```
📝 ANOTA AQUÍ:

Project URL: _____________________________________________

anon/public key: _________________________________________

service_role key: ________________________________________
(Click "Reveal" primero para verla)
```

---

## 4️⃣ CONFIGURAR BACKEND (2 min)

### Abre una Terminal y ejecuta ESTOS comandos:

```bash
# 1. Ir a la carpeta backend
cd /Users/williambe/Documents/transroute/backend

# 2. Copiar archivo de ejemplo
cp .env.example .env

# 3. Editar archivo (se abrirá nano)
nano .env
```

### Dentro de nano:

1. Busca estas 3 líneas:
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
```

2. Reemplaza con TUS credenciales que copiaste arriba

3. Presiona:
   - `Ctrl + X` (para salir)
   - `Y` (para confirmar)
   - `Enter` (para guardar)

### Continúa en la misma terminal:

```bash
# 4. Instalar dependencias (toma ~1 minuto)
npm install

# 5. Iniciar backend
npm run start:dev
```

✅ **Debe aparecer:** "TransRoute API running on: http://localhost:3000/api/v1"

**⚠️ DEJA ESTA TERMINAL ABIERTA Y CORRIENDO**

---

## 5️⃣ CONFIGURAR FRONTEND (2 min)

### Abre una NUEVA Terminal (la anterior debe seguir corriendo):

```bash
# 1. Ir a la carpeta frontend
cd /Users/williambe/Documents/transroute/frontend

# 2. Copiar archivo de ejemplo
cp .env.local.example .env.local

# 3. Editar archivo
nano .env.local
```

### Dentro de nano:

1. Busca estas 2 líneas:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

2. Reemplaza con TUS credenciales (URL y ANON KEY solamente)

3. Presiona:
   - `Ctrl + X`
   - `Y`
   - `Enter`

### Continúa en la misma terminal:

```bash
# 4. Instalar dependencias (toma ~1 minuto)
npm install

# 5. Iniciar frontend
npm run dev
```

✅ **Debe aparecer:** "Ready started server on 0.0.0.0:3001"

**⚠️ DEJA ESTA TERMINAL TAMBIÉN ABIERTA Y CORRIENDO**

---

## 6️⃣ ¡ABRIR EN TU NAVEGADOR! 🎉

### Abre:
👉 **http://localhost:3001**

### Deberías ver:
- ✅ Página de inicio de TransRoute
- ✅ Botones de "Iniciar Sesión" y "Registrarse"

### Haz click en "Iniciar Sesión" y usa:

```
📧 Email: owner@transroute.com
🔑 Password: password123
```

### ¡LISTO! Deberías ver el Dashboard 🎊

---

## 🎯 ¿QUÉ DEBERÍAS VER?

✅ Dashboard con estadísticas  
✅ Menú lateral (en desktop)  
✅ Bottom navigation (en móvil)  
✅ Botón de modo oscuro ☀️/🌙  
✅ Icono de usuario en header  

---

## ❌ SOLUCIÓN DE PROBLEMAS

### "Error: EADDRINUSE" (puerto ocupado)

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

Luego reinicia los servidores.

### "Cannot connect to database"

- Verifica que las credenciales en `.env` sean correctas
- NO debe haber espacios antes o después
- Asegúrate que ejecutaste los SQL scripts

### "Module not found"

```bash
# En backend
cd /Users/williambe/Documents/transroute/backend
rm -rf node_modules package-lock.json
npm install

# En frontend  
cd /Users/williambe/Documents/transroute/frontend
rm -rf node_modules package-lock.json .next
npm install
```

---

## 🆘 ¿NECESITAS MÁS AYUDA?

Lee estos archivos en orden:
1. `COMANDOS.txt` - Comandos rápidos
2. `START.md` - Guía completa
3. `README.md` - Documentación completa

---

## ✅ CHECKLIST FINAL

- [ ] Proyecto de Supabase creado
- [ ] Scripts SQL ejecutados (schema.sql y seed.sql)
- [ ] Credenciales de Supabase copiadas
- [ ] Backend configurado (.env creado)
- [ ] Backend corriendo en http://localhost:3000
- [ ] Frontend configurado (.env.local creado)
- [ ] Frontend corriendo en http://localhost:3001
- [ ] Login exitoso en http://localhost:3001
- [ ] Dashboard visible

---

## 🎉 ¡FELICIDADES!

Ya tienes TransRoute corriendo localmente.

Ahora puedes:
- 📊 Explorar el dashboard
- 🚌 Crear viajes
- 🎫 Hacer reservaciones
- 💰 Ver transacciones
- 📈 Generar reportes
- ⚙️ Gestionar tu empresa

**¡Disfruta TransRoute! 🚀**

