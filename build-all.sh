#!/bin/bash

echo "🔨 Building remotes..."

# Build remote-products
echo "Building remote-products..."
cd apps/remote-products
pnpm run build
cp .nuxt/dist/client/remoteEntry.js .output/public/remoteEntry.js
echo "✓ remote-products built"

# Build remote-cart
echo "Building remote-cart..."
cd ../remote-cart
pnpm run build
cp .nuxt/dist/client/remoteEntry.js .output/public/remoteEntry.js
echo "✓ remote-cart built"

# Build host
echo "Building host..."
cd ../host
pnpm run build
echo "✓ host built"

cd ../..
echo "✅ All builds complete!"
echo ""
echo "To start preview servers:"
echo "  Remote Products: cd apps/remote-products && PORT=3001 node .output/server/index.mjs"
echo "  Remote Cart:     cd apps/remote-cart && PORT=3002 node .output/server/index.mjs"
echo "  Host:            cd apps/host && PORT=3000 node .output/server/index.mjs"
