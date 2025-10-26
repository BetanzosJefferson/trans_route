#!/bin/bash

# ============================================
# TRANSROUTE - Script de Detención
# ============================================
# Detiene backend y/o frontend limpiamente
# Uso: ./stop.sh [backend|frontend|all]

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Banner
echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🛑 TRANSROUTE - Detener Servidores"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Función para detener servicio
stop_service() {
    local service=$1
    local port=$2
    
    echo -e "\n${YELLOW}🔍 Deteniendo $service (puerto $port)...${NC}"
    
    # Verificar si hay algo corriendo
    if ! lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service ya estaba detenido${NC}"
        return 0
    fi
    
    # Obtener PIDs
    PIDS=$(lsof -ti:$port)
    
    # Matar procesos
    echo -e "   PIDs encontrados: $PIDS"
    kill -9 $PIDS 2>/dev/null || true
    
    # Matar procesos npm relacionados
    pkill -f "npm run.*$service" 2>/dev/null || true
    
    # Esperar un momento
    sleep 2
    
    # Verificar que se detuvo
    if lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${RED}❌ No se pudo detener $service completamente${NC}"
        echo -e "   Intenta manualmente: kill -9 \$(lsof -ti:$port)"
        exit 1
    else
        echo -e "${GREEN}✅ $service detenido correctamente${NC}"
    fi
}

# Procesar argumentos
MODE=${1:-all}

case $MODE in
    backend)
        stop_service "Backend" 3001
        ;;
    frontend)
        stop_service "Frontend" 3000
        ;;
    all)
        stop_service "Backend" 3001
        stop_service "Frontend" 3000
        ;;
    *)
        echo -e "${RED}❌ Uso: ./stop.sh [backend|frontend|all]${NC}"
        exit 1
        ;;
esac

# Resumen
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Servidores detenidos exitosamente${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

