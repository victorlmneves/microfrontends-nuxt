#!/bin/bash

echo "🔨 Building all apps..."

# Build remotes first
echo "Building remote-products..."
cd apps/remote-products && pnpm build
echo "✓ remote-products built"

echo "Building remote-cart..."
cd ../remote-cart && pnpm build
echo "✓ remote-cart built"

# Build host
echo "Building host..."
cd ../host && pnpm build
echo "✓ host built"

cd ../..

echo ""
echo "✅ All builds complete!"
echo ""
echo "🚀 Starting preview servers..."
echo ""

# Start remotes in background
echo "Starting remote-products on :3001..."
cd apps/remote-products && PORT=3001 npx serve -s .output/public &
REMOTE_PRODUCTS_PID=$!

echo "Starting remote-cart on :3002..."
cd ../remote-cart && PORT=3002 npx serve -s .output/public &
REMOTE_CART_PID=$!

# Start host
echo "Starting host on :3000..."
cd ../host && PORT=3000 node .output/server/index.mjs &
HOST_PID=$!

cd ../..

echo ""
echo "✅ All servers running!"
echo ""
echo "📋 URLs:"
echo "  🏠 Host:     http://localhost:3000"
echo "  📦 Products: http://localhost:3001"
echo "  🛒 Cart:     http://localhost:3002"
echo ""
echo "⌨️  Press Ctrl+C to stop all servers"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $REMOTE_PRODUCTS_PID $REMOTE_CART_PID $HOST_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

trap cleanup INT TERM

# Wait for user interrupt
wait
