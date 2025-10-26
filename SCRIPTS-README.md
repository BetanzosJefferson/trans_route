# 🛠️ Scripts de Gestión - TransRoute

Scripts de utilidad para gestionar el desarrollo del proyecto TransRoute.

## 📋 Scripts Disponibles

### 1. `restart.sh` - Reinicio de Servicios

Reinicia el backend y/o frontend de forma limpia.

**Uso:**
```bash
./restart.sh [backend|frontend|all]
```

**Ejemplos:**
```bash
./restart.sh                # Reinicia todo (backend + frontend)
./restart.sh backend        # Solo reinicia backend
./restart.sh frontend       # Solo reinicia frontend
```

**Lo que hace:**
- ✅ Mata procesos anteriores en puertos 3001 y 3000
- ✅ Limpia cache (`dist/`, `.next/`)
- ✅ Verifica e instala dependencias
- ✅ Inicia servicios en background
- ✅ Verifica que estén corriendo correctamente

---

### 2. `logs.sh` - Visor de Logs

Muestra y sigue los logs del backend y frontend.

**Uso:**
```bash
./logs.sh [comando] [opciones]
```

**Comandos:**
```bash
./logs.sh                      # Ver últimas 50 líneas de ambos
./logs.sh backend              # Ver solo backend
./logs.sh frontend             # Ver solo frontend
./logs.sh backend 100          # Ver últimas 100 líneas del backend
./logs.sh follow all           # Seguir ambos logs en tiempo real
./logs.sh follow backend       # Seguir solo backend en tiempo real
./logs.sh status               # Ver estado de los servicios
./logs.sh clean                # Limpiar archivos de log
```

**Características:**
- 🎨 Logs coloreados (errores en rojo, warnings en amarillo, success en verde)
- 📡 Modo "follow" para ver logs en tiempo real
- 📊 Estado de servicios con PIDs
- 🧹 Limpieza de archivos de log

---

### 3. `stop.sh` - Detener Servicios

Detiene el backend y/o frontend de forma segura.

**Uso:**
```bash
./stop.sh [backend|frontend|all]
```

**Ejemplos:**
```bash
./stop.sh                   # Detiene todo
./stop.sh backend           # Solo detiene backend
./stop.sh frontend          # Solo detiene frontend
```

**Lo que hace:**
- ✅ Encuentra procesos en los puertos 3000 y 3001
- ✅ Mata procesos de forma segura
- ✅ Verifica que se hayan detenido correctamente
- ✅ Limpia procesos npm relacionados

---

### 4. `check-health.sh` - Diagnóstico Completo

Verifica el estado completo del sistema.

**Uso:**
```bash
./check-health.sh
```

**Lo que verifica:**
- ✅ Node.js y npm instalados
- ✅ Dependencias (`node_modules`)
- ✅ Estado de servicios (backend/frontend)
- ✅ Accesibilidad de APIs
- ✅ Archivos de log y errores recientes
- ✅ Variables de entorno (`.env`)
- ✅ Espacio en disco y memoria
- ✅ Recursos del sistema

**Salida:**
- Reporte visual con colores
- Contador de problemas encontrados
- Enlaces rápidos a servicios
- Comandos útiles sugeridos

---

## 🚀 Flujo de Trabajo Recomendado

### Al Iniciar el Día

```bash
# 1. Verificar estado del sistema
./check-health.sh

# 2. Si todo está bien, reiniciar servicios
./restart.sh

# 3. Ver logs para confirmar inicio
./logs.sh status
```

### Durante el Desarrollo

```bash
# Ver logs en tiempo real (en una terminal aparte)
./logs.sh follow all

# Si algo falla, reiniciar el servicio problemático
./restart.sh backend        # o frontend
```

### Si hay Problemas

```bash
# 1. Ver diagnóstico completo
./check-health.sh

# 2. Ver logs completos del servicio problemático
./logs.sh backend 200

# 3. Detener todo y reiniciar limpiamente
./stop.sh
./logs.sh clean
./restart.sh
```

### Al Finalizar el Día

```bash
# Detener servicios
./stop.sh

# Opcional: Limpiar logs
./logs.sh clean
```

---

## 📁 Archivos de Log

Los scripts generan y utilizan estos archivos:

- `backend/backend.log` - Logs del servidor NestJS
- `frontend/frontend.log` - Logs del servidor Next.js

**Ubicación de logs:**
- Backend: `/Users/williambe/Documents/transroute/backend/backend.log`
- Frontend: `/Users/williambe/Documents/transroute/frontend/frontend.log`

---

## 🎨 Códigos de Color

Los scripts usan colores para facilitar la lectura:

- 🟢 **Verde**: Éxito, todo correcto
- 🟡 **Amarillo**: Advertencia, no crítico
- 🔴 **Rojo**: Error, requiere atención
- 🔵 **Azul**: Información general
- 🔷 **Cyan**: Títulos de secciones

---

## ⚙️ Puertos Utilizados

- **Backend**: `3001`
  - API: http://localhost:3001/api/v1
  - Docs: http://localhost:3001/api/docs

- **Frontend**: `3000`
  - App: http://localhost:3000

---

## 🔧 Solución de Problemas

### "Permission denied" al ejecutar scripts

```bash
chmod +x *.sh
```

### Puerto ocupado después de matar procesos

```bash
# Forzar liberación del puerto
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Backend/Frontend no inicia

```bash
# 1. Verificar logs
./logs.sh backend 200

# 2. Limpiar todo y reinstalar
cd backend && rm -rf node_modules dist && npm install
cd ../frontend && rm -rf node_modules .next && npm install

# 3. Reiniciar
./restart.sh
```

### Ver todos los procesos de Node.js

```bash
ps aux | grep node
```

### Limpiar todo el proyecto

```bash
# ADVERTENCIA: Esto eliminará todo excepto el código
cd backend && rm -rf node_modules dist backend.log
cd ../frontend && rm -rf node_modules .next frontend.log
```

---

## 📝 Notas

- Los scripts usan `nohup` para ejecutar servicios en background
- Los logs se escriben en tiempo real en los archivos `.log`
- Los scripts verifican que los servicios estén respondiendo antes de confirmar éxito
- Se incluyen delays estratégicos para dar tiempo a que los servicios inicien
- Los scripts son seguros: verifican antes de matar procesos y confirman después

---

## 🤝 Contribuir

Si mejoras algún script:
1. Mantén el formato de colores y mensajes
2. Documenta nuevas funciones
3. Prueba en diferentes escenarios
4. Actualiza este README

---

**Última actualización**: 2025-10-26

