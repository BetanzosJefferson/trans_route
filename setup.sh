#!/bin/bash

echo "🚀 TransRoute - Setup Automático"
echo "================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para leer credenciales
read_credentials() {
    echo -e "${YELLOW}Por favor ingresa tus credenciales de Supabase:${NC}"
    echo ""
    echo "1. Ve a: https://supabase.com/dashboard"
    echo "2. Abre tu proyecto → Settings → API"
    echo ""
    
    read -p "Project URL (https://xxx.supabase.co): " SUPABASE_URL
    read -p "Anon/Public Key (eyJhbGc...): " SUPABASE_ANON_KEY
    read -p "Service Role Key (eyJhbGc...): " SUPABASE_SERVICE_KEY
    
    echo ""
}

# Crear archivo .env para backend
create_backend_env() {
    echo -e "${GREEN}📝 Creando backend/.env...${NC}"
    cat > backend/.env << EOF
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}

JWT_SECRET=mi-super-secreto-jwt-transroute-2025
JWT_EXPIRATION=7d

CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=debug
EOF
    echo -e "${GREEN}✅ backend/.env creado${NC}"
}

# Crear archivo .env.local para frontend
create_frontend_env() {
    echo -e "${GREEN}📝 Creando frontend/.env.local...${NC}"
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
EOF
    echo -e "${GREEN}✅ frontend/.env.local creado${NC}"
}

# Instalar dependencias del backend
install_backend() {
    echo ""
    echo -e "${GREEN}📦 Instalando dependencias del backend...${NC}"
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✅ Backend listo${NC}"
}

# Instalar dependencias del frontend
install_frontend() {
    echo ""
    echo -e "${GREEN}📦 Instalando dependencias del frontend...${NC}"
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✅ Frontend listo${NC}"
}

# Iniciar servidores
start_servers() {
    echo ""
    echo -e "${GREEN}🚀 Iniciando servidores...${NC}"
    echo ""
    
    # Abrir 2 terminales nuevas
    osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/backend\" && npm run start:dev"'
    sleep 2
    osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/frontend\" && npm run dev"'
    
    echo -e "${GREEN}✅ Servidores iniciados en nuevas terminales${NC}"
    echo ""
    echo -e "${YELLOW}Accede a:${NC}"
    echo "  🎨 Frontend: http://localhost:3001"
    echo "  🔧 Backend API: http://localhost:3000/api/v1"
    echo "  📚 Swagger: http://localhost:3000/api/docs"
    echo ""
    echo -e "${YELLOW}Usuario de prueba:${NC}"
    echo "  Email: owner@transroute.com"
    echo "  Password: password123"
    echo ""
}

# Flujo principal
main() {
    # Verificar si ya se ejecutaron los SQL
    echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
    echo "¿Ya ejecutaste los scripts SQL en Supabase?"
    echo "  1. database/schema.sql"
    echo "  2. database/seed.sql (opcional)"
    echo ""
    read -p "¿Ya los ejecutaste? (s/n): " SQL_DONE
    
    if [ "$SQL_DONE" != "s" ] && [ "$SQL_DONE" != "S" ]; then
        echo ""
        echo -e "${RED}⚠️  Por favor ejecuta primero los scripts SQL:${NC}"
        echo "1. Ve a https://supabase.com/dashboard"
        echo "2. Abre tu proyecto → SQL Editor"
        echo "3. Copia y pega database/schema.sql → Run"
        echo "4. Copia y pega database/seed.sql → Run"
        echo ""
        echo "Luego ejecuta este script nuevamente."
        exit 1
    fi
    
    # Leer credenciales
    read_credentials
    
    # Crear archivos .env
    create_backend_env
    create_frontend_env
    
    # Instalar dependencias
    install_backend
    install_frontend
    
    # Iniciar servidores
    start_servers
}

# Ejecutar
main

