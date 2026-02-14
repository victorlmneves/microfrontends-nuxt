#!/bin/bash

# Microfrontends Startup Script
# This script starts all three applications concurrently

echo "🚀 Starting Microfrontends Demo..."
echo ""
echo "Host App:     http://localhost:3000"
echo "Products:     http://localhost:3001"
echo "Cart:         http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop all applications"
echo ""

# Start all apps in parallel
pnpm run dev
