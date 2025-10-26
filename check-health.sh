#!/bin/bash

# ============================================
# TRANSROUTE - Health Check
# ============================================
# Verifica el estado completo del proyecto
# Uso: ./check-health.sh

set +e  # No salir en errores para poder mostrar todo

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Directorio del proyecto
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Variables de control
ISSUES=0

# Banner
clear
echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🏥 TRANSROUTE - Diagnóstico de Salud del Sistema"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"
sleep 1

# 1. Verificar Node.js y npm
echo -e "${CYAN}━━━━ 1. Entorno de Desarrollo ━━━━${NC}\n"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js instalado:${NC} $NODE_VERSION"
else
    echo -e "${RED}❌ Node.js no encontrado${NC}"
    ((ISSUES++))
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm instalado:${NC} $NPM_VERSION"
else
    echo -e "${RED}❌ npm no encontrado${NC}"
    ((ISSUES++))
fi

# 2. Verificar dependencias
echo -e "\n${CYAN}━━━━ 2. Dependencias del Proyecto ━━━━${NC}\n"

# Backend
if [ -d "$PROJECT_DIR/backend/node_modules" ]; then
    echo -e "${GREEN}✅ Backend node_modules instalados${NC}"
else
    echo -e "${YELLOW}⚠️  Backend node_modules no encontrados${NC}"
    echo -e "   Ejecuta: cd backend && npm install"
    ((ISSUES++))
fi

# Frontend
if [ -d "$PROJECT_DIR/frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend node_modules instalados${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend node_modules no encontrados${NC}"
    echo -e "   Ejecuta: cd frontend && npm install"
    ((ISSUES++))
fi

# 3. Estado de los servicios
echo -e "\n${CYAN}━━━━ 3. Estado de Servicios ━━━━${NC}\n"

# Backend
if lsof -ti:3001 > /dev/null 2>&1; then
    BACKEND_PID=$(lsof -ti:3001)
    echo -e "${GREEN}✅ Backend corriendo en puerto 3001${NC}"
    echo -e "   PID: $BACKEND_PID"
    
    # Verificar accesibilidad
    if curl -s http://localhost:3001/api/v1 > /dev/null; then
        echo -e "${GREEN}   ✅ API accesible${NC}"
    else
        echo -e "${YELLOW}   ⚠️  API no responde${NC}"
        ((ISSUES++))
    fi
else
    echo -e "${RED}❌ Backend no está corriendo${NC}"
    echo -e "   Ejecuta: ./restart.sh backend"
    ((ISSUES++))
fi

# Frontend
if lsof -ti:3000 > /dev/null 2>&1; then
    FRONTEND_PID=$(lsof -ti:3000)
    echo -e "${GREEN}✅ Frontend corriendo en puerto 3000${NC}"
    echo -e "   PID: $FRONTEND_PID"
    
    # Verificar accesibilidad
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}   ✅ Aplicación accesible${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Aplicación no responde${NC}"
        ((ISSUES++))
    fi
else
    echo -e "${RED}❌ Frontend no está corriendo${NC}"
    echo -e "   Ejecuta: ./restart.sh frontend"
    ((ISSUES++))
fi

# 4. Archivos de log
echo -e "\n${CYAN}━━━━ 4. Archivos de Log ━━━━${NC}\n"

# Backend log
if [ -f "$PROJECT_DIR/backend/backend.log" ]; then
    BACKEND_LOG_SIZE=$(du -h "$PROJECT_DIR/backend/backend.log" | cut -f1)
    BACKEND_LOG_LINES=$(wc -l < "$PROJECT_DIR/backend/backend.log")
    echo -e "${GREEN}✅ backend.log encontrado${NC}"
    echo -e "   Tamaño: $BACKEND_LOG_SIZE | Líneas: $BACKEND_LOG_LINES"
    
    # Buscar errores recientes
    BACKEND_ERRORS=$(tail -n 100 "$PROJECT_DIR/backend/backend.log" | grep -i "error" | wc -l)
    if [ $BACKEND_ERRORS -gt 0 ]; then
        echo -e "${YELLOW}   ⚠️  $BACKEND_ERRORS errores en últimas 100 líneas${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  backend.log no encontrado${NC}"
fi

# Frontend log
if [ -f "$PROJECT_DIR/frontend/frontend.log" ]; then
    FRONTEND_LOG_SIZE=$(du -h "$PROJECT_DIR/frontend/frontend.log" | cut -f1)
    FRONTEND_LOG_LINES=$(wc -l < "$PROJECT_DIR/frontend/frontend.log")
    echo -e "${GREEN}✅ frontend.log encontrado${NC}"
    echo -e "   Tamaño: $FRONTEND_LOG_SIZE | Líneas: $FRONTEND_LOG_LINES"
    
    # Buscar errores recientes
    FRONTEND_ERRORS=$(tail -n 100 "$PROJECT_DIR/frontend/frontend.log" | grep -i "error" | wc -l)
    if [ $FRONTEND_ERRORS -gt 0 ]; then
        echo -e "${YELLOW}   ⚠️  $FRONTEND_ERRORS errores en últimas 100 líneas${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  frontend.log no encontrado${NC}"
fi

# 5. Variables de entorno
echo -e "\n${CYAN}━━━━ 5. Configuración ━━━━${NC}\n"

# Backend .env
if [ -f "$PROJECT_DIR/backend/.env" ]; then
    echo -e "${GREEN}✅ backend/.env encontrado${NC}"
    
    # Verificar variables clave (sin mostrar valores sensibles)
    if grep -q "SUPABASE_URL" "$PROJECT_DIR/backend/.env"; then
        echo -e "   ${GREEN}✅${NC} SUPABASE_URL configurado"
    else
        echo -e "   ${RED}❌${NC} SUPABASE_URL no encontrado"
        ((ISSUES++))
    fi
    
    if grep -q "SUPABASE_KEY" "$PROJECT_DIR/backend/.env"; then
        echo -e "   ${GREEN}✅${NC} SUPABASE_KEY configurado"
    else
        echo -e "   ${RED}❌${NC} SUPABASE_KEY no encontrado"
        ((ISSUES++))
    fi
else
    echo -e "${RED}❌ backend/.env no encontrado${NC}"
    ((ISSUES++))
fi

# Frontend .env
if [ -f "$PROJECT_DIR/frontend/.env.local" ]; then
    echo -e "${GREEN}✅ frontend/.env.local encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env.local no encontrado${NC}"
    echo -e "   El frontend puede usar valores por defecto"
fi

# 6. Espacio en disco
echo -e "\n${CYAN}━━━━ 6. Recursos del Sistema ━━━━${NC}\n"

# Espacio en disco
DISK_USAGE=$(df -h "$PROJECT_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 90 ]; then
    echo -e "${GREEN}✅ Espacio en disco: ${DISK_USAGE}% usado${NC}"
else
    echo -e "${YELLOW}⚠️  Espacio en disco: ${DISK_USAGE}% usado${NC}"
    echo -e "   Considera limpiar archivos innecesarios"
fi

# Memoria
if command -v free &> /dev/null; then
    MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    echo -e "${GREEN}✅ Memoria RAM: ${MEMORY_USAGE}% usado${NC}"
fi

# Tamaño de node_modules
if [ -d "$PROJECT_DIR/backend/node_modules" ] && [ -d "$PROJECT_DIR/frontend/node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sh "$PROJECT_DIR/backend/node_modules" "$PROJECT_DIR/frontend/node_modules" 2>/dev/null | awk '{sum+=$1} END {print sum}')
    echo -e "${BLUE}ℹ️  Tamaño de node_modules: ~${NODE_MODULES_SIZE}${NC}"
fi

# Resumen final
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}"
    echo "  ✅ ¡TODO EN ORDEN!"
    echo "  El sistema está funcionando correctamente"
    echo -e "${NC}"
else
    echo -e "${YELLOW}"
    echo "  ⚠️  SE ENCONTRARON $ISSUES PROBLEMAS"
    echo "  Revisa los mensajes arriba para más detalles"
    echo -e "${NC}"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Enlaces útiles
echo -e "${CYAN}🔗 Enlaces Rápidos:${NC}"
echo -e "   Backend API:  http://localhost:3001/api/v1"
echo -e "   API Docs:     http://localhost:3001/api/docs"
echo -e "   Frontend:     http://localhost:3000"
echo ""

# Comandos útiles
echo -e "${CYAN}💡 Comandos Útiles:${NC}"
echo -e "   ./restart.sh       - Reiniciar servicios"
echo -e "   ./logs.sh follow   - Ver logs en tiempo real"
echo -e "   ./stop.sh          - Detener servicios"
echo ""

exit $ISSUES

