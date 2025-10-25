#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔄 REINICIO LIMPIO DEL BACKEND                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "🛑 1. Matando procesos antiguos de NestJS..."
pkill -9 -f "nest start"
sleep 1

echo "🛑 2. Liberando puerto 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 1

echo "🧹 3. Limpiando código compilado..."
cd /Users/williambe/Documents/transroute/backend
rm -rf dist/
echo "   ✅ Carpeta dist/ eliminada"

echo ""
echo "🚀 4. Iniciando backend..."
npm run start:dev > backend.log 2>&1 &

echo ""
echo "⏳ Esperando a que el backend inicie..."
sleep 5

echo ""
echo "🔍 Verificando procesos..."
PROCESS_COUNT=$(ps aux | grep "nest start" | grep -v grep | wc -l | tr -d ' ')

if [ "$PROCESS_COUNT" -eq "1" ]; then
    echo "   ✅ Solo hay 1 proceso de NestJS corriendo"
else
    echo "   ⚠️  Hay $PROCESS_COUNT procesos de NestJS corriendo"
fi

echo ""
echo "🔍 Verificando puerto 3001..."
PORT_PROCESS=$(lsof -i :3001 | grep LISTEN | wc -l | tr -d ' ')

if [ "$PORT_PROCESS" -eq "1" ]; then
    echo "   ✅ Puerto 3001 ocupado por 1 proceso"
else
    echo "   ⚠️  Puerto 3001 ocupado por $PORT_PROCESS procesos"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                ✅ BACKEND REINICIADO                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Logs del backend:"
echo "   tail -f backend/backend.log"
echo ""
echo "🧪 Tests disponibles:"
echo "   node backend/test-full-flow.js"
echo ""
echo "🌐 URL del backend:"
echo "   http://localhost:3001/api/v1"

