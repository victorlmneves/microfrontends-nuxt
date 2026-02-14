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

**Option A: Hybrid Mode - Recommended**

Remotes in preview (built), host in dev (hot reload):

```bash
pnpm run dev:watch
```

**Option B: All in Dev Mode**

Everything with hot reload (slower startup):

```bash
pnpm run dev
```

**Option C: Test Production Build**

Build everything and run in production mode:

```bash
./test-build.sh
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
# Start all apps
pnpm run dev

# Build all apps
pnpm run build

# Work on individual apps
cd apps/host && pnpm run dev
cd apps/remote-products && pnpm run dev
cd apps/remote-cart && pnpm run dev
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
