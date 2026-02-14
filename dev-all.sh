#!/bin/bash

echo "🚀 Starting all dev servers..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Obter diretório do script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Função para cleanup
cleanup() {
    echo -e "\n🛑 Stopping all servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Limpar cache
echo "🧹 Clearing cache..."
rm -rf "$SCRIPT_DIR/apps/*/.nuxt"

# Iniciar remote-products na porta 3001
echo -e "${BLUE}Starting remote-products on port 3001...${NC}"
cd "$SCRIPT_DIR/apps/remote-products" && pnpm dev > /tmp/remote-products.log 2>&1 &
PRODUCTS_PID=$!

# Aguardar um pouco
sleep 2

# Iniciar remote-cart na porta 3002
echo -e "${BLUE}Starting remote-cart on port 3002...${NC}"
cd "$SCRIPT_DIR/apps/remote-cart" && pnpm dev > /tmp/remote-cart.log 2>&1 &
CART_PID=$!

# Aguardar um pouco
sleep 2

# Iniciar host na porta 3000
echo -e "${BLUE}Starting host on port 3000...${NC}"
cd "$SCRIPT_DIR/apps/host" && pnpm dev > /tmp/host.log 2>&1 &
HOST_PID=$!

sleep 3

echo ""
echo -e "${GREEN}✅ All servers started!${NC}"
echo ""
echo "📋 URLs:"
echo "  🏠 Host:            http://localhost:3000"
echo "  📦 Remote Products: http://localhost:3001"
echo "  🛒 Remote Cart:     http://localhost:3002"
echo ""
echo "📝 Logs:"
echo "  tail -f /tmp/remote-products.log"
echo "  tail -f /tmp/remote-cart.log"
echo "  tail -f /tmp/host.log"
echo ""
echo "⌨️  Press Ctrl+C to stop all servers"
echo ""

# Aguardar
wait
