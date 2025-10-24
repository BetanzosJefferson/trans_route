#!/bin/bash

echo "🔍 TransRoute - Verificador de Configuración"
echo "============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar archivos
echo "📁 Verificando archivos..."
echo ""

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ backend/.env existe${NC}"
else
    echo -e "${RED}❌ backend/.env NO existe${NC}"
    echo -e "${YELLOW}   Ejecuta: cd backend && cp .env.example .env${NC}"
fi

if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✅ frontend/.env.local existe${NC}"
else
    echo -e "${RED}❌ frontend/.env.local NO existe${NC}"
    echo -e "${YELLOW}   Ejecuta: cd frontend && cp .env.local.example .env.local${NC}"
fi

echo ""
echo "📦 Verificando dependencias..."
echo ""

if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅ Backend: dependencias instaladas${NC}"
else
    echo -e "${RED}❌ Backend: dependencias NO instaladas${NC}"
    echo -e "${YELLOW}   Ejecuta: cd backend && npm install${NC}"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend: dependencias instaladas${NC}"
else
    echo -e "${RED}❌ Frontend: dependencias NO instaladas${NC}"
    echo -e "${YELLOW}   Ejecuta: cd frontend && npm install${NC}"
fi

echo ""
echo "🌐 Verificando servidores..."
echo ""

if curl -s http://localhost:3000/api/v1 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend corriendo en http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend NO está corriendo${NC}"
    echo -e "${YELLOW}   Ejecuta: cd backend && npm run start:dev${NC}"
fi

if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend corriendo en http://localhost:3001${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend NO está corriendo${NC}"
    echo -e "${YELLOW}   Ejecuta: cd frontend && npm run dev${NC}"
fi

echo ""
echo "============================================="
echo ""

# Verificar configuración
if [ -f "backend/.env" ]; then
    echo "🔐 Verificando configuración de backend/.env:"
    
    if grep -q "xxxxxxxxxxxxx" backend/.env; then
        echo -e "${RED}❌ Las credenciales NO han sido configuradas${NC}"
        echo -e "${YELLOW}   Edita backend/.env con tus credenciales de Supabase${NC}"
    else
        echo -e "${GREEN}✅ Credenciales configuradas (parece correcto)${NC}"
    fi
fi

echo ""

if [ -f "frontend/.env.local" ]; then
    echo "🔐 Verificando configuración de frontend/.env.local:"
    
    if grep -q "xxxxxxxxxxxxx" frontend/.env.local; then
        echo -e "${RED}❌ Las credenciales NO han sido configuradas${NC}"
        echo -e "${YELLOW}   Edita frontend/.env.local con tus credenciales de Supabase${NC}"
    else
        echo -e "${GREEN}✅ Credenciales configuradas (parece correcto)${NC}"
    fi
fi

echo ""
echo "============================================="
echo ""
echo "📝 Resumen:"
echo ""

ALL_OK=true

[ ! -f "backend/.env" ] && ALL_OK=false
[ ! -f "frontend/.env.local" ] && ALL_OK=false
[ ! -d "backend/node_modules" ] && ALL_OK=false
[ ! -d "frontend/node_modules" ] && ALL_OK=false

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✅ Todo parece estar configurado correctamente${NC}"
    echo ""
    echo "Para iniciar los servidores:"
    echo ""
    echo "Terminal 1: cd backend && npm run start:dev"
    echo "Terminal 2: cd frontend && npm run dev"
    echo ""
    echo "Luego abre: http://localhost:3001"
else
    echo -e "${YELLOW}⚠️  Faltan algunos pasos de configuración${NC}"
    echo ""
    echo "Lee: ▶️ EMPIEZA-AQUI.md"
fi

echo ""

