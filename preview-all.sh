#!/bin/bash

echo "🚀 Starting preview servers..."

# Start remote-products
echo "Starting remote-products on port 3001..."
cd apps/remote-products && npx serve .output/public -l 3001 &
PRODUCTS_PID=$!

# Start remote-cart
echo "Starting remote-cart on port 3002..."
cd ../../apps/remote-cart && npx serve .output/public -l 3002 &
CART_PID=$!

# Start host
echo "Starting host on port 3000..."
cd ../../apps/host && PORT=3000 node .output/server/index.mjs &
HOST_PID=$!

cd ../../..

echo ""
echo "✅ All servers started!"
echo ""
echo "URLs:"
echo "  Host:            http://localhost:3000"
echo "  Remote Products: http://localhost:3001"
echo "  Remote Cart:     http://localhost:3002"
echo ""
echo "PIDs: Products=$PRODUCTS_PID Cart=$CART_PID Host=$HOST_PID"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "echo '\n🛑 Stopping servers...'; kill $PRODUCTS_PID $CART_PID $HOST_PID; exit" INT
wait
