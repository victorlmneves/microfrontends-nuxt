# Module Federation Setup - Final Configuration

## ✅ Working Configuration

This document describes the **final working setup** for Module Federation with Nuxt 3 using **Webpack 5** and **@module-federation/enhanced**.

## Quick Summary

- **Host**: Uses `@module-federation/runtime` with Webpack builder
- **Remotes**: Use `@module-federation/enhanced/webpack` plugin
- **Pattern**: Client-only loading via `loadRemoteComponentUniversal()` in `onMounted()`
- **SSR**: Enabled on host, but remotes load only on client
- **Key**: Use enhanced plugin for compatibility with runtime API

---

## Architecture

### Host Application (Consumer)

**Dependencies:**

```json
{
    "dependencies": {
        "@module-federation/runtime": "2.0.1",
        "@module-federation/node": "2.7.32",
        "nuxt": "3.14.159",
        "vue": "3.5.13"
    },
    "devDependencies": {
        "@nuxt/webpack-builder": "4.3.1"
    }
}
```

**Configuration (`nuxt.config.ts`):**

```typescript
export default defineNuxtConfig({
    ssr: true,
    builder: 'webpack',

    webpack: {
        externals: {
            '@module-federation/node': 'commonjs @module-federation/node'
        }
    },

    vite: {
        server: { cors: true }
    }
})
```

**Utility Loader (`utils/loadRemoteUniversal.ts`):**

```typescript
export async function loadRemoteComponentUniversal(
    remoteName: string,
    remoteEntry: string,
    exposedModule: string
): Promise<Record<string, unknown>> {
    if (typeof window === 'undefined') {
        throw new Error('This loader is client-only')
    }

    const runtime = await import('@module-federation/runtime')
    let instance = runtime.getInstance()

    if (!instance) {
        instance = runtime.createInstance({
            name: 'host',
            remotes: [{ name: remoteName, entry: remoteEntry }]
        })
    } else {
        instance.registerRemotes([{ name: remoteName, entry: remoteEntry }])
    }

    const module = await instance.loadRemote(`${remoteName}/${exposedModule}`)
    return module.default || module
}
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

**Dependencies:**

```json
{
    "dependencies": {
        "nuxt": "3.14.159",
        "vue": "3.5.13"
    },
    "devDependencies": {
        "@module-federation/enhanced": "^2.0.1",
        "webpack": "5.91.0",
        "vue-loader": "^17",
        "ts-loader": "9.5.4",
        "sass-loader": "16.0.7"
    }
}
```

**Webpack Configuration (`webpack.client.mjs`):**

```javascript
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack'
import { VueLoaderPlugin } from 'vue-loader'
import path from 'path'

export default {
    mode: 'development',
    entry: './app.vue',
    target: 'web',
    output: {
        path: path.resolve(path.dirname(new URL(import.meta.url).pathname), 'dist'),
        filename: '[name].js',
        publicPath: 'http://localhost:3001/',
        clean: false
    },
    resolve: {
        extensions: ['.js', '.ts', '.mjs', '.json', '.vue']
    },
    module: {
        rules: [
            { test: /\.vue$/, loader: 'vue-loader' },
            { test: /\.(ts|tsx)$/, loader: 'ts-loader', options: { transpileOnly: true }, exclude: /node_modules/ },
            { test: /\.m?js$/, type: 'javascript/auto' },
            { test: /\.scss$/, use: ['vue-style-loader', 'css-loader', 'sass-loader'] }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new ModuleFederationPlugin({
            name: 'remoteProducts',
            filename: 'remoteEntry.js',
            exposes: {
                './ProductList': './components/ProductList.vue'
            },
            shared: {
                vue: { singleton: true, requiredVersion: false }
            },
            dts: false
        })
    ],
    devServer: {
        port: 3001,
        hot: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        allowedHosts: 'all'
    }
}
```

**Package.json scripts:**

```json
{
    "scripts": {
        "dev:webpack": "webpack serve --config webpack.client.mjs --port 3001",
        "build:webpack": "webpack --config webpack.client.mjs"
    }
}
```

---

## Build Process

### Development Mode

**Start all servers:**

```bash
./dev-all.sh
# or
pnpm run dev:all
```

**What happens:**

1. Remote Products: `webpack serve` on port 3001 (HMR enabled)
2. Remote Cart: `webpack serve` on port 3002 (HMR enabled)
3. Host: `nuxt dev` on port 3000 (SSR + client-side federation)

**How it works:**

- Remotes serve `remoteEntry.js` from webpack-dev-server in-memory
- Host loads remotes dynamically on client-side via `@module-federation/runtime`
- SSR renders loading state, client loads actual components

### Production Build

```bash
pnpm run build:all
```

**Build steps:**

1. Remotes: `webpack --config webpack.client.mjs` → `dist/remoteEntry.js`
2. Host: `nuxt build` → `.output/`
3. Deploy remotes to CDN/static hosting
4. Update remote URLs in host configuration

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
5. **Runtime in host only**: `@module-federation/runtime` only in host
6. **Vite plugin in remotes only**: `@module-federation/vite` only in remotes

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
- [ ] `@module-federation/runtime` in host only
- [ ] `@module-federation/vite` in remotes only
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
│   └── package.json                        # @module-federation/runtime
│
├── remote-products/
│   ├── components/
│   │   └── ProductList.vue                 # Exposed component
│   ├── nuxt.config.ts                      # MF Vite plugin + CORS
│   └── package.json                        # @module-federation/vite
│
└── remote-cart/
    ├── components/
    │   └── ShoppingCart.vue                # Exposed component
    ├── nuxt.config.ts                      # MF Vite plugin + CORS
    └── package.json                        # @module-federation/vite
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
