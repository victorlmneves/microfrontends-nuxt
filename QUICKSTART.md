# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1️⃣ Install pnpm (if not installed)

```bash
# Install pnpm globally
npm install -g pnpm@8.15.0

# Or use corepack (recommended)
corepack enable
corepack prepare pnpm@8.15.0 --activate
```

### 2️⃣ Install Dependencies

```bash
pnpm install
```

This installs all dependencies for the entire monorepo.

### 3️⃣ Start the Development Environment

**Option A: All Development Servers (Recommended)**

Start all servers with webpack dev servers for remotes:

```bash
./dev-all.sh
```

This starts:

- Remote Products: webpack-dev-server on port 3001
- Remote Cart: webpack-dev-server on port 3002
- Host: nuxt dev on port 3000

**Option B: Individual Servers**

Start each server manually:

```bash
# Terminal 1 - Remote Products
cd apps/remote-products && pnpm dev:webpack

# Terminal 2 - Remote Cart
cd apps/remote-cart && pnpm dev:webpack

# Terminal 3 - Host
cd apps/host && pnpm dev
```

### 4️⃣ Open Your Browser

- **Host Application**: http://localhost:3000
    - Home page: http://localhost:3000
    - Products page: http://localhost:3000/products
    - Cart page: http://localhost:3000/cart
- **Products Remote (standalone)**: http://localhost:3001
- **Cart Remote (standalone)**: http://localhost:3002

## 🎯 What You'll See

### At localhost:3000 (Host App)

- **Home page** - Overview of the microfrontends architecture
- **Products page** - Product catalog loaded from remote-products microfrontend
- **Cart page** - Shopping cart loaded from remote-cart microfrontend

### At localhost:3001 (Products Remote)

- Standalone products application
- Can run independently without the host

### At localhost:3002 (Cart Remote)

- Standalone cart application
- Can run independently without the host

## 🎨 Key Features to Explore

1. **Navigate** between pages in the host app
2. **Inspect** the browser DevTools Network tab to see remote module loading
3. **Try stopping** one of the remote apps to see error handling
4. **Modify** a remote component and see it update in the host (HMR)

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- Check [SETUP.md](./SETUP.md) for detailed setup instructions
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Learn how to [add new microfrontends](./ADDING_MICROFRONTEND.md)

## ⚡ Common Commands

```bash
# Start all servers
./dev-all.sh

# Start individual servers
cd apps/remote-products && pnpm dev:webpack  # Port 3001
cd apps/remote-cart && pnpm dev:webpack      # Port 3002
cd apps/host && pnpm dev                      # Port 3000

# Build remotes
cd apps/remote-products && pnpm build:webpack
cd apps/remote-cart && pnpm build:webpack

# Build host
cd apps/host && pnpm build

# Kill all processes and clean
pkill -9 -f "webpack" && pkill -9 -f "nuxt"
rm -rf apps/*/dist apps/*/.nuxt
```

## 🔍 Project Structure

```
microfrontends-nuxt/
├── apps/
│   ├── host/              # Main host app (3000)
│   ├── remote-products/   # Products microfrontend (3001)
│   └── remote-cart/       # Cart microfrontend (3002)
├── packages/
│   └── shared-components/ # Shared UI components
└── turbo.json            # Turborepo config
```

## 💡 Tips

- All components use **Vue 3 Composition API** with **TypeScript**
- Code style: `<script setup>` → `<template>` → `<style scoped>`
- Indentation: **4 spaces**
- All comments and text are in **English**

Enjoy exploring microfrontends! 🎉
