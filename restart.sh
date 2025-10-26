#!/bin/bash

# ============================================
# TRANSROUTE - Script de Reinicio Completo
# ============================================
# Reinicia backend y frontend limpiamente
# Uso: ./restart.sh [backend|frontend|all]

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Banner
echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔄 TRANSROUTE - Reinicio de Servidores"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Función para matar procesos
kill_processes() {
    local service=$1
    local port=$2
    
    echo -e "${YELLOW}🔍 Buscando procesos en puerto $port...${NC}"
    
    # Matar por puerto
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    
    # Matar procesos npm específicos
    pkill -f "npm run.*$service" 2>/dev/null || true
    
    # Dar tiempo para que se liberen los recursos
    sleep 2
    
    echo -e "${GREEN}✅ Puerto $port liberado${NC}"
}

# Función para limpiar cache
clean_cache() {
    local service=$1
    
    echo -e "${YELLOW}🧹 Limpiando cache de $service...${NC}"
    
    if [ "$service" == "backend" ]; then
        cd "$PROJECT_DIR/backend"
        rm -rf dist/ 2>/dev/null || true
        rm -f backend.log 2>/dev/null || true
        echo -e "${GREEN}✅ Cache de backend limpiado${NC}"
    elif [ "$service" == "frontend" ]; then
        cd "$PROJECT_DIR/frontend"
        rm -rf .next/ 2>/dev/null || true
        rm -f frontend.log 2>/dev/null || true
        echo -e "${GREEN}✅ Cache de frontend limpiado${NC}"
    fi
}

# Función para iniciar backend
start_backend() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🚀 Iniciando Backend (Puerto 3001)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    # Matar procesos existentes
    kill_processes "backend" 3001
    
    # Limpiar cache
    clean_cache "backend"
    
    # Iniciar backend
    cd "$PROJECT_DIR/backend"
    echo -e "${YELLOW}📦 Verificando dependencias...${NC}"
    npm install --silent
    
    echo -e "${GREEN}🎯 Iniciando servidor backend...${NC}"
    nohup npm run start:dev > backend.log 2>&1 &
    
    # Esperar a que inicie
    sleep 5
    
    # Verificar que está corriendo
    if lsof -ti:3001 > /dev/null; then
        echo -e "${GREEN}✅ Backend iniciado correctamente en http://localhost:3001${NC}"
        echo -e "${GREEN}   📚 Docs: http://localhost:3001/api/docs${NC}"
    else
        echo -e "${RED}❌ Error al iniciar backend. Revisa: backend/backend.log${NC}"
        exit 1
    fi
}

# Función para iniciar frontend
start_frontend() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🚀 Iniciando Frontend (Puerto 3000)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    # Matar procesos existentes
    kill_processes "frontend" 3000
    
    # Limpiar cache
    clean_cache "frontend"
    
    # Iniciar frontend
    cd "$PROJECT_DIR/frontend"
    echo -e "${YELLOW}📦 Verificando dependencias...${NC}"
    npm install --silent
    
    echo -e "${GREEN}🎯 Iniciando servidor frontend...${NC}"
    nohup npm run dev > frontend.log 2>&1 &
    
    # Esperar a que inicie
    sleep 5
    
    # Verificar que está corriendo
    if lsof -ti:3000 > /dev/null; then
        echo -e "${GREEN}✅ Frontend iniciado correctamente en http://localhost:3000${NC}"
    else
        echo -e "${RED}❌ Error al iniciar frontend. Revisa: frontend/frontend.log${NC}"
        exit 1
    fi
}

# Procesar argumentos
MODE=${1:-all}

case $MODE in
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    all)
        start_backend
        start_frontend
        ;;
    *)
        echo -e "${RED}❌ Uso: ./restart.sh [backend|frontend|all]${NC}"
        exit 1
        ;;
esac

# Resumen final
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Reinicio completado exitosamente${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "📊 ${YELLOW}Para ver los logs en tiempo real:${NC}"
echo -e "   ./logs.sh\n"

echo -e "🛑 ${YELLOW}Para detener los servidores:${NC}"
echo -e "   ./stop.sh\n"

