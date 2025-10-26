#!/bin/bash

# ============================================
# TRANSROUTE - Visor de Logs
# ============================================
# Muestra logs del backend, frontend y tests
# Uso: ./logs.sh [backend|frontend|all|follow]

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Directorio del proyecto
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Banner
echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📋 TRANSROUTE - Visor de Logs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Función para mostrar logs de backend
show_backend_logs() {
    local lines=${1:-50}
    
    echo -e "\n${CYAN}━━━━ BACKEND LOGS (últimas $lines líneas) ━━━━${NC}\n"
    
    if [ -f "$PROJECT_DIR/backend/backend.log" ]; then
        tail -n $lines "$PROJECT_DIR/backend/backend.log" | while IFS= read -r line; do
            # Colorear según nivel
            if [[ $line == *"ERROR"* ]] || [[ $line == *"error"* ]]; then
                echo -e "${RED}$line${NC}"
            elif [[ $line == *"WARN"* ]] || [[ $line == *"warning"* ]]; then
                echo -e "${YELLOW}$line${NC}"
            elif [[ $line == *"SUCCESS"* ]] || [[ $line == *"✅"* ]]; then
                echo -e "${GREEN}$line${NC}"
            else
                echo "$line"
            fi
        done
    else
        echo -e "${YELLOW}⚠️  No se encontró backend.log${NC}"
        echo -e "   El backend no se ha iniciado o no ha generado logs aún."
    fi
}

# Función para mostrar logs de frontend
show_frontend_logs() {
    local lines=${1:-50}
    
    echo -e "\n${CYAN}━━━━ FRONTEND LOGS (últimas $lines líneas) ━━━━${NC}\n"
    
    if [ -f "$PROJECT_DIR/frontend/frontend.log" ]; then
        tail -n $lines "$PROJECT_DIR/frontend/frontend.log" | while IFS= read -r line; do
            # Colorear según nivel
            if [[ $line == *"error"* ]] || [[ $line == *"Error"* ]]; then
                echo -e "${RED}$line${NC}"
            elif [[ $line == *"warn"* ]] || [[ $line == *"Warning"* ]]; then
                echo -e "${YELLOW}$line${NC}"
            elif [[ $line == *"ready"* ]] || [[ $line == *"compiled"* ]]; then
                echo -e "${GREEN}$line${NC}"
            else
                echo "$line"
            fi
        done
    else
        echo -e "${YELLOW}⚠️  No se encontró frontend.log${NC}"
        echo -e "   El frontend no se ha iniciado o no ha generado logs aún."
    fi
}

# Función para verificar status de servicios
show_status() {
    echo -e "\n${CYAN}━━━━ ESTADO DE SERVICIOS ━━━━${NC}\n"
    
    # Backend (puerto 3001)
    if lsof -ti:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend: ${NC}Corriendo en puerto 3001"
        echo -e "   PID: $(lsof -ti:3001)"
    else
        echo -e "${RED}❌ Backend: ${NC}No está corriendo"
    fi
    
    # Frontend (puerto 3000)
    if lsof -ti:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend:${NC} Corriendo en puerto 3000"
        echo -e "   PID: $(lsof -ti:3000)"
    else
        echo -e "${RED}❌ Frontend:${NC} No está corriendo"
    fi
    
    echo ""
}

# Función para seguir logs en tiempo real
follow_logs() {
    local service=$1
    
    echo -e "${CYAN}📡 Siguiendo logs en tiempo real...${NC}"
    echo -e "${YELLOW}   (Presiona Ctrl+C para detener)${NC}\n"
    
    sleep 1
    
    case $service in
        backend)
            if [ -f "$PROJECT_DIR/backend/backend.log" ]; then
                tail -f "$PROJECT_DIR/backend/backend.log"
            else
                echo -e "${RED}❌ No existe backend.log${NC}"
                exit 1
            fi
            ;;
        frontend)
            if [ -f "$PROJECT_DIR/frontend/frontend.log" ]; then
                tail -f "$PROJECT_DIR/frontend/frontend.log"
            else
                echo -e "${RED}❌ No existe frontend.log${NC}"
                exit 1
            fi
            ;;
        all)
            # Seguir ambos logs simultáneamente
            if [ -f "$PROJECT_DIR/backend/backend.log" ] && [ -f "$PROJECT_DIR/frontend/frontend.log" ]; then
                tail -f "$PROJECT_DIR/backend/backend.log" "$PROJECT_DIR/frontend/frontend.log"
            elif [ -f "$PROJECT_DIR/backend/backend.log" ]; then
                tail -f "$PROJECT_DIR/backend/backend.log"
            elif [ -f "$PROJECT_DIR/frontend/frontend.log" ]; then
                tail -f "$PROJECT_DIR/frontend/frontend.log"
            else
                echo -e "${RED}❌ No existen archivos de log${NC}"
                exit 1
            fi
            ;;
    esac
}

# Función para limpiar logs
clean_logs() {
    echo -e "${YELLOW}🧹 Limpiando archivos de log...${NC}"
    
    rm -f "$PROJECT_DIR/backend/backend.log"
    rm -f "$PROJECT_DIR/frontend/frontend.log"
    
    echo -e "${GREEN}✅ Logs limpiados${NC}\n"
}

# Procesar argumentos
MODE=${1:-all}
LINES=${2:-50}

case $MODE in
    backend)
        show_status
        show_backend_logs $LINES
        ;;
    frontend)
        show_status
        show_frontend_logs $LINES
        ;;
    all)
        show_status
        show_backend_logs $LINES
        show_frontend_logs $LINES
        ;;
    follow)
        SERVICE=${2:-all}
        follow_logs $SERVICE
        ;;
    clean)
        clean_logs
        ;;
    status)
        show_status
        ;;
    *)
        echo -e "${YELLOW}Uso:${NC}"
        echo -e "  ./logs.sh [backend|frontend|all] [líneas]    - Ver logs"
        echo -e "  ./logs.sh follow [backend|frontend|all]      - Seguir logs en tiempo real"
        echo -e "  ./logs.sh status                              - Ver estado de servicios"
        echo -e "  ./logs.sh clean                               - Limpiar archivos de log"
        echo -e "\n${YELLOW}Ejemplos:${NC}"
        echo -e "  ./logs.sh backend 100   - Ver últimas 100 líneas del backend"
        echo -e "  ./logs.sh follow all    - Seguir ambos logs en tiempo real"
        echo -e "  ./logs.sh status        - Ver si los servicios están corriendo"
        exit 1
        ;;
esac

# Footer con opciones útiles
if [ "$MODE" != "follow" ] && [ "$MODE" != "clean" ]; then
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}💡 Comandos útiles:${NC}"
    echo -e "   ./logs.sh follow all    - Seguir logs en tiempo real"
    echo -e "   ./logs.sh clean         - Limpiar archivos de log"
    echo -e "   ./restart.sh            - Reiniciar servidores"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
fi

