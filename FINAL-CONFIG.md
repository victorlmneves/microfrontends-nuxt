# Module Federation Setup - Final Configuration

## ✅ Working Configuration

This document describes the **final working setup** for Module Federation with Nuxt 3.

## Quick Summary

- **Host**: Uses `@module-federation/runtime` (no Vite plugin)
- **Remotes**: Use `@module-federation/vite` 1.10.0 plugin (installed in root)
- **Pattern**: `getInstance()` → `createInstance()` → `loadRemote()`
- **Key**: `shared: {}` must be empty (critical!)
- **Dependencies**: All dev/build tools in root package.json for monorepo efficiency
- **App packages**: Only declare runtime dependencies (`nuxt`, `vue`)

---

## Architecture

### Host Application (Consumer)

**Dependencies:**

```json
{
    "@module-federation/runtime": "2.0.1"
}
```

**Configuration (`nuxt.config.ts`):**

```typescript
export default defineNuxtConfig({
    ssr: false,
    vite: {
        server: { cors: true },
        optimizeDeps: {
            exclude: ['@module-federation/runtime']
        }
    }
})
```

**Runtime Plugin (`plugins/01.mf-runtime.client.ts`):**

```typescript
import { getInstance, createInstance } from '@module-federation/runtime'

export default defineNuxtPlugin(() => {
    let instance = getInstance()

    if (!instance) {
        instance = createInstance({
            name: 'host',
            remotes: [
                { name: 'remoteProducts', entry: 'http://localhost:3001/remoteEntry.js' },
                { name: 'remoteCart', entry: 'http://localhost:3002/remoteEntry.js' }
            ]
        })
    }
})
```

**Component Usage (`pages/products.vue`):**

```vue
<script setup lang="ts">
import { getInstance, createInstance } from '@module-federation/runtime'
import { ref, onMounted, type Component } from 'vue'

const RemoteProductList = ref<Component | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(true)

const loadRemoteComponent = async () => {
    try {
        let instance = getInstance()

        if (!instance) {
            instance = createInstance({
                name: 'host',
                remotes: [
                    {
                        name: 'remoteProducts',
                        entry: 'http://localhost:3001/remoteEntry.js'
                    }
                ]
            })
        }

        const module = await instance.loadRemote('remoteProducts/ProductList')
        RemoteProductList.value = (module as any).default || module
        isLoading.value = false
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Load failed'
        isLoading.value = false
    }
}

onMounted(() => loadRemoteComponent())
</script>

<template>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <component v-else-if="RemoteProductList" :is="RemoteProductList" />
</template>
```

---

### Remote Applications (Providers)

**Dependencies** (installed in root package.json):

```json
{
    "@module-federation/vite": "1.10.0",
    "@nuxt/devtools": "2.6.4",
    "typescript": "5.6.3",
    "vite-plugin-top-level-await": "1.6.0",
    "vue-tsc": "2.1.10"
}
```

> **Note**: In this monorepo setup, all development and build tools are installed in the root package.json and shared across all apps via pnpm workspace hoisting. Individual remote packages only declare their runtime dependencies (`nuxt`, `vue`).

**Configuration (`nuxt.config.ts`):**

```typescript
import { federation } from '@module-federation/vite'
import TopAwait from 'vite-plugin-top-level-await'

export default defineNuxtConfig({
    ssr: false,

    nitro: {
        static: true // ← Critical!
    },

    routeRules: {
        // ← Must be at root level!
        '/remoteEntry.js': {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/javascript'
            }
        },
        '/_nuxt/**': {
            headers: { 'Access-Control-Allow-Origin': '*' }
        }
    },

    hooks: {
        'vite:extendConfig': (config, { isClient }) => {
            if (!isClient) return

            config.plugins = config.plugins || []
            config.plugins.unshift(
                federation({
                    name: 'remoteProducts',
                    filename: 'remoteEntry.js',
                    exposes: {
                        './ProductList': './components/ProductList.vue'
                    },
                    shared: {} // ← Must be empty!
                }),
                TopAwait()
            )
        }
    }
})
```

---

## Build Process

### Build Script (`build-all.sh`)

```bash
#!/bin/bash

# Build remotes
echo "Building remote-products..."
cd apps/remote-products && pnpm build

# Copy remoteEntry.js to public output
cp .nuxt/dist/client/remoteEntry.js .output/public/

echo "Building remote-cart..."
cd ../remote-cart && pnpm build
cp .nuxt/dist/client/remoteEntry.js .output/public/

# Build host
echo "Building host..."
cd ../host && pnpm build

echo "✅ All builds complete!"
```

### Why Copy remoteEntry.js?

Nuxt's Nitro with `static: true` serves from `.output/public/`, but Module Federation outputs to `.nuxt/dist/client/`. The copy ensures the entry file is accessible.

---

## Development Workflow

### Recommended: Hybrid Mode

```bash
pnpm run dev:watch
```

**What it does:**

1. Builds remotes (static output)
2. Serves remotes in preview mode (fast)
3. Starts host in dev mode (hot reload)
4. Watches for remote changes and rebuilds

**Advantages:**

- Fast startup (remotes pre-built)
- Host has full HMR
- Simulates production for remotes
- Best for daily development

### Alternative: Full Dev Mode

```bash
pnpm run dev
```

All apps in dev mode with hot reload (slower startup).

### Production Test

```bash
./test-build.sh
```

Builds and serves everything in production mode.

---

## Critical Configuration Points

### ✅ Must Do

1. **Empty shared config**: `shared: {}` in all apps
2. **CORS at root level**: `routeRules` not inside `nitro`
3. **Static preset for remotes**: `nitro: { static: true }`
4. **Copy remoteEntry.js**: After build, copy to `.output/public/`
5. **Runtime in host only**: `@module-federation/runtime` only in host package.json
6. **Vite plugin in root**: `@module-federation/vite` and `vite-plugin-top-level-await` in root package.json (shared via pnpm workspace)

### ❌ Don't Do

1. ~~Don't use shared dependencies~~ (causes crashes)
2. ~~Don't use Vite plugin in host~~ (conflicts with runtime)
3. ~~Don't put routeRules inside nitro~~ (must be at root)
4. ~~Don't use node-server preset for remotes~~ (use static)
5. ~~Don't use direct imports~~ (`import('remote/Component')` - use `loadRemote()`)

---

## Troubleshooting Guide

### Remote Not Loading

**Check:**

1. Is remote running? → http://localhost:3001
2. Is remoteEntry.js accessible? → http://localhost:3001/remoteEntry.js
3. Does it return JavaScript (not HTML)?
4. Check browser console for CORS/network errors

**Common fixes:**

- Ensure build script copied remoteEntry.js
- Verify CORS headers in `routeRules`
- Check remote is in preview/dev mode

### "Cannot read properties of undefined"

**Problem:** Component not loading correctly

**Fix:**

```typescript
// Use both patterns
const component = (module as any).default || module
```

### CORS Errors

**Problem:** Browser blocks cross-origin requests

**Fix in remote's `nuxt.config.ts`:**

```typescript
routeRules: {  // At root level!
  '/remoteEntry.js': {
    headers: { 'Access-Control-Allow-Origin': '*' }
  },
}
```

### App Crashes When Adding Shared Dependencies

**Problem:** App fails with shared config like:

```typescript
shared: {
    vue: {
        singleton: true
    }
} // ❌ Causes crashes
```

**Fix:** Use empty object:

```typescript
shared: {
} // ✅ Works
```

### remoteEntry.js Returns HTML (404 page)

**Problem:** Nitro serves index.html instead of remoteEntry.js

**Fix:** Copy file to .output/public/ in build script

---

## Development Checklist

Before starting development:

- [ ] All dependencies installed (`pnpm install`)
- [ ] `@module-federation/runtime` in host package.json
- [ ] `@module-federation/vite` + `vite-plugin-top-level-await` in root package.json
- [ ] All `shared: {}` configs are empty
- [ ] `nitro.static: true` in all remotes
- [ ] `routeRules` at root level (not in nitro)
- [ ] Runtime plugin created in host
- [ ] Build scripts copy remoteEntry.js to .output/public/

Before committing:

- [ ] Run `pnpm run dev:watch` - all apps load correctly
- [ ] Run `./test-build.sh` - production build works
- [ ] Check http://localhost:3001/remoteEntry.js returns JS
- [ ] Test all remote components load in host
- [ ] No console errors in browser
- [ ] No CORS errors

---

## File Structure Reference

```
apps/
├── host/
│   ├── plugins/
│   │   ├── 00.require-polyfill.client.ts  # Polyfill for MF
│   │   └── 01.mf-runtime.client.ts        # Federation Runtime init
│   ├── pages/
│   │   ├── products.vue                    # Loads remoteProducts
│   │   └── cart.vue                        # Loads remoteCart
│   ├── nuxt.config.ts                      # No MF Vite plugin
│   └── package.json                        # @module-federation/runtime only
│
├── remote-products/
│   ├── components/
│   │   └── ProductList.vue                 # Exposed component
│   ├── nuxt.config.ts                      # Uses MF from root via workspace
│   └── package.json                        # Nuxt core dependencies only
│
└── remote-cart/
    ├── components/
    │   └── ShoppingCart.vue                # Exposed component
    ├── nuxt.config.ts                      # Uses MF from root via workspace
    └── package.json                        # Nuxt core dependencies only
```

---

## Next Steps

### For Production

1. **Environment variables** for remote URLs
2. **Error boundaries** for remote load failures
3. **Loading states** and skeletons
4. **Retry logic** for failed remote loads
5. **Monitoring** for remote availability
6. **CDN** for remotes (static hosting)

### For Optimization

1. **Shared dependencies** (carefully test!)
2. **Code splitting** in remotes
3. **Preloading** remotes on hover/idle
4. **Caching** strategies
5. **Bundle size analysis**

### For Testing

1. **Unit tests** for components
2. **Integration tests** for federation
3. **E2E tests** with Playwright
4. **Load testing** for remotes

---

## Support & Resources

- **Module Federation Docs**: https:/ /module-federation.io
- **Nuxt Docs**: https://nuxt.com
- **Vite Docs**: https://vitejs.dev

## Summary

This setup provides:

- ✅ True runtime loading (no build-time coupling)
- ✅ Independent deployability
- ✅ Standalone remote apps
- ✅ Simple shared config (empty = no conflicts)
- ✅ CORS handled correctly
- ✅ Fast development workflow
- ✅ Production-ready builds

The key insight: **Host uses runtime API, remotes use build plugin**. This separation provides the best of both worlds.
