# Microfrontends with Nuxt 3 + Module Federation + Turborepo

A production-ready example of microfrontends architecture using Nuxt 3, Module Federation Runtime, and Turborepo in a monorepo setup.

## 🏗️ Architecture Overview

This project demonstrates a microfrontends architecture with:

- **Host App** (port 3000): Main application that dynamically loads remote microfrontends
- **Remote Products** (port 3001): Standalone app exposing a product catalog component
- **Remote Cart** (port 3002): Standalone app exposing a shopping cart component
- **Shared Components**: Reusable components shared across the monorepo

### Key Technologies

- **Nuxt 3.21.1** - Vue 3 framework with SSR disabled for SPA mode
- **@module-federation/runtime 2.0.1** - Runtime API for dynamic remote loading
- **@module-federation/vite 1.10.0** - Vite plugin for remotes only
- **Turborepo** - Monorepo build orchestration
- **pnpm** - Fast, disk-space efficient package manager

### Module Federation Flow

```
┌─────────────────────────────────────────┐
│          Host App (3000)                │
│  ┌───────────────────────────────────┐  │
│  │  Uses Federation Runtime API     │  │
│  │  • getInstance() / createInstance│  │
│  │  • loadRemote()                  │  │
│  │  • Dynamic component loading     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           ↓                    ↓
    ┌──────────┐         ┌──────────┐
    │ Products │         │   Cart   │
    │  (3001)  │         │  (3002)  │
    │ Built +  │         │ Built +  │
    │ Served   │         │ Served   │
    └──────────┘         └──────────┘
```

## 📁 Project Structure

```
microfrontends-nuxt/
├── apps/
│   ├── host/                    # Main host application
│   │   ├── pages/
│   │   │   ├── index.vue       # Home page
│   │   │   ├── products.vue    # Products page (loads remote)
│   │   │   └── cart.vue        # Cart page (loads remote)
│   │   ├── app.vue
│   │   ├── nuxt.config.ts
│   │   └── package.json
│   │
│   ├── remote-products/         # Products microfrontend
│   │   ├── components/
│   │   │   └── ProductList.vue # Exposed component
│   │   ├── app.vue
│   │   ├── nuxt.config.ts
│   │   └── package.json
│   │
│   └── remote-cart/             # Cart microfrontend
│       ├── components/
│       │   └── ShoppingCart.vue # Exposed component
│       ├── app.vue
│       ├── nuxt.config.ts
│       └── package.json
│
├── packages/
│   └── shared-components/       # Shared UI components
│       ├── components/
│       │   └── Button.vue
│       ├── index.ts
│       └── package.json
│
├── package.json                 # Root package.json
└── turbo.json                   # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8.15.0+

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

### Running the Applications

#### Development Mode (Hybrid - Recommended)

Start remotes in preview mode (built) and host in dev mode with watch:

```bash
pnpm run dev:watch
```

This will:
1. Build remotes (remote-products, remote-cart)
2. Serve remotes in preview mode (ports 3001, 3002)
3. Start host in dev mode with hot reload (port 3000)

#### All in Dev Mode

Start all applications in development mode:

```bash
pnpm run dev
```

#### Build and Preview All

Test everything in production mode:

```bash
./test-build.sh
```

Or manually:

```bash
pnpm run build:all
pnpm run preview:all
```

### URLs

- **Host**: http://localhost:3000
  - Home: http://localhost:3000
  - Products: http://localhost:3000/products (loads remote)
  - Cart: http://localhost:3000/cart (loads remote)
- **Products Remote**: http://localhost:3001
- **Cart Remote**: http://localhost:3002

---

## 📚 Documentation

- **[FINAL-CONFIG.md](./FINAL-CONFIG.md)** - ⭐ Current working configuration (start here!)
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide (3 steps)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture details and patterns
- **[SETUP.md](./SETUP.md)** - Complete setup guide with code examples
- **[HOW-TO-START.md](./HOW-TO-START.md)** - Different ways to start the apps
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🎯 Key Features

- **Runtime Loading**: Host dynamically loads remotes at runtime (no build-time coupling)
- **Independent Deployment**: Each remote can be deployed independently
- **Standalone Apps**: Remotes can run as standalone applications
- **Type Safety**: Full TypeScript support
- **Hot Module Replacement**: Fast development experience
- **Production Ready**: Optimized builds for production deployment

---

### Running Individual Apps

```bash
# From the root directory
cd apps/host && npm run dev
cd apps/remote-products && npm run dev
cd apps/remote-cart && npm run dev
```

## 🔧 Configuration Overview

### Host Configuration

The host uses **@module-federation/runtime** for dynamic loading:

**plugins/01.mf-runtime.client.ts:**
```typescript
import { getInstance, createInstance } from '@module-federation/runtime'

export default defineNuxtPlugin(() => {
  let instance = getInstance()
  
  if (!instance) {
    instance = createInstance({
      name: 'host',
      remotes: [
        { name: 'remoteProducts', entry: 'http://localhost:3001/remoteEntry.js' },
        { name: 'remoteCart', entry: 'http://localhost:3002/remoteEntry.js' },
      ],
    })
  }
})
```

### Remote Configuration

Remote  use **@module-federation/vite** plugin:

**nuxt.config.ts:**
```typescript
import { federation } from '@module-federation/vite'
import TopAwait from 'vite-plugin-top-level-await'

export default defineNuxtConfig({
  ssr: false,
  nitro: { static: true },
  
  hooks: {
    'vite:extendConfig': (config, { isClient }) => {
      if (!isClient) return
      
      config.plugins.unshift(
        federation({
          name: 'remoteProducts',
          filename: 'remoteEntry.js',
          exposes: {
            './ProductList': './components/ProductList.vue',
          },
          shared: {},  // Empty!
        }),
        TopAwait()
      )
    },
  },
})
```

### Loading Remote Components

**pages/products.vue:**
```vue
<script setup lang="ts">
import { getInstance } from '@module-federation/runtime'
import { ref, onMounted } from 'vue'

const RemoteProductList = ref(null)

onMounted(async () => {
  const instance = getInstance()
  const module = await instance.loadRemote('remoteProducts/ProductList')
  RemoteProductList.value = module.default || module
})
</script>

<template>
  <component v-if="RemoteProductList" :is="RemoteProductList" />
</template>
```

## 📦 Building for Production

Build all applications:

```bash
npm run build
```

Build individual apps:

```bash
cd apps/host && npm run build
cd apps/remote-products && npm run build
cd apps/remote-cart && npm run build
```

## 🎯 Key Features

### 1. **Independent Development**
Each microfrontend can be developed, tested, and deployed independently.

### 2. **Runtime Integration**
Components are loaded at runtime, not build time, allowing for dynamic updates.

### 3. **Shared Dependencies**
Vue is shared as a singleton across all microfrontends to avoid duplication.

### 4. **Monorepo Benefits**
- Unified dependency management
- Shared components package
- Coordinated builds with Turborepo
- Consistent tooling and configuration

### 5. **Type Safety**
Full TypeScript support with Vue 3 Composition API.

## 🏛️ Architecture Patterns

### Component Exposure Pattern
Remote apps expose specific components via Module Federation:
```typescript
exposes: {
    './ComponentName': './path/to/Component.vue'
}
```

### Lazy Loading Pattern
Host app loads remote components asynchronously:
```typescript
const RemoteComponent = defineAsyncComponent(() => 
    import('remoteName/ComponentName')
)
```

### Shared State Pattern
While this example uses local state, in production you might:
- Use a state management library (Pinia)
- Implement event bus for cross-microfrontend communication
- Use URL parameters for shared context

## 🛠️ Turborepo Configuration

The `turbo.json` defines the build tasks:

```json
{
    "tasks": {
        "dev": {
            "cache": false,
            "persistent": true
        },
        "build": {
            "dependsOn": ["^build"],
            "outputs": [".nuxt/**", ".output/**"]
        }
    }
}
```

## 🎨 Vue Component Style

All Vue components follow this structure:
1. `<script setup lang="ts">` - Composition API with TypeScript
2. `<template>` - Component template
3. `<style scoped>` - Scoped styles

Example:
```vue
<script setup lang="ts">
// Logic here
</script>

<template>
    <!-- Template here -->
</template>

<style scoped>
    /* Styles here with 4-space indentation */
</style>
```

## 🚧 Common Issues & Solutions

### Issue: Remote module not loading
**Solution**: Ensure all three apps are running simultaneously. The host needs the remote apps to be available.

### Issue: CORS errors
**Solution**: All apps are configured for the same origin in development. In production, configure CORS headers appropriately.

### Issue: Vue version mismatch
**Solution**: The `shared` configuration ensures Vue is a singleton. Keep all apps on the same Vue version.

## 📚 Additional Resources

- [Module Federation](https://module-federation.io/)
- [Nuxt 3 Documentation](https://nuxt.com/)
- [Turborepo Documentation](https://turbo.build/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

## 🔮 Production Considerations

1. **Deployment**: Deploy each microfrontend independently
2. **Versioning**: Use semantic versioning for exposed components
3. **Error Handling**: Implement fallbacks for failed remote loads
4. **Performance**: Consider code splitting and lazy loading strategies
5. **Security**: Validate remote sources and implement CSP headers
6. **Monitoring**: Add logging and error tracking for each microfrontend

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and patterns.
