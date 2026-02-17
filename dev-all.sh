#!/bin/bash

echo "🚀 Starting all dev servers..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function for cleanup
cleanup() {
    echo -e "\n🛑 Stopping all servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Clear cache
echo "🧹 Clearing cache..."
rm -rf "$SCRIPT_DIR/apps/*/.nuxt"

echo -e "${BLUE}Starting remote-products (webpack) on port 3001...${NC}"
cd "$SCRIPT_DIR/apps/remote-products" && pnpm dev:webpack > /tmp/remote-products.log 2>&1 &
PRODUCTS_PID=$!
cd "$SCRIPT_DIR"

# Wait a bit
sleep 2

echo -e "${BLUE}Starting remote-cart (webpack) on port 3002...${NC}"
cd "$SCRIPT_DIR/apps/remote-cart" && pnpm dev:webpack > /tmp/remote-cart.log 2>&1 &
CART_PID=$!
cd "$SCRIPT_DIR"

# Wait a bit
sleep 2

echo -e "${BLUE}Starting host on port 3000...${NC}"
cd "$SCRIPT_DIR/apps/host" && pnpm dev > /tmp/host.log 2>&1 &
HOST_PID=$!
cd "$SCRIPT_DIR"

# Wait a bit
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

wait
