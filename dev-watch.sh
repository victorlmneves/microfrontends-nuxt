#!/bin/bash

echo "🚀 Starting dev with watch mode (builds on change)..."

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

cleanup() {
    echo -e "\n🛑 Stopping all servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "🧹 Initial build..."
"$SCRIPT_DIR/build-all.sh"

echo ""
echo -e "${BLUE}Starting remotes in preview mode...${NC}"

# Remote Products
cd "$SCRIPT_DIR/apps/remote-products" && npx serve .output/public -l 3001 --cors > /tmp/remote-products.log 2>&1 &

# Remote Cart  
cd "$SCRIPT_DIR/apps/remote-cart" && npx serve .output/public -l 3002 --cors > /tmp/remote-cart.log 2>&1 &

sleep 2

# Host in dev mode (hot reload)
echo -e "${BLUE}Starting host in dev mode...${NC}"
cd "$SCRIPT_DIR/apps/host" && pnpm dev > /tmp/host.log 2>&1 &

sleep 3

echo ""
echo -e "${GREEN}✅ Dev environment ready!${NC}"
echo ""
echo "📋 URLs:"
echo "  🏠 Host (dev):      http://localhost:3000"
echo "  📦 Products (built): http://localhost:3001"
echo "  🛒 Cart (built):     http://localhost:3002"
echo ""
echo "💡 Para rebuildar remotes:"
echo "   cd apps/remote-products && pnpm build"
echo "   cd apps/remote-cart && pnpm build"
echo ""
echo "⌨️  Press Ctrl+C to stop"

wait
