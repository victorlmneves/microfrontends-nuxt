# Setup Guide - Module Federation with Nuxt 3

## Current Configuration Summary

### Versions
- Nuxt: 3.21.1
- Vue: 3.5.28  
- Vite: 7.3.1
- @module-federation/runtime: 2.0.1 (host only)
- @module-federation/vite: 1.10.0 (remotes only)
- pnpm: 8.15.0

### Host Configuration

**Package.json dependencies:**
```json
{
  "dependencies": {
    "@module-federation/runtime": "2.0.1",
    "nuxt": "^3.14.159",
    "vue": "^3.5.13"
  }
}
```

**nuxt.config.ts:**
```typescript
export default defineNuxtConfig({
  ssr: false,
  vite: {
    server: {
      cors: true,
    },
    optimizeDeps: {
      exclude: ['@module-federation/runtime'],
    },
  },
})
```

**plugins/01.mf-runtime.client.ts:**
```typescript
import { getInstance, createInstance } from '@module-federation/runtime'

export default defineNuxtPlugin(() => {
  let instance = getInstance()
  
  if (!instance) {
    instance = createInstance({
      name: 'host',
      remotes: [
        {
          name: 'remoteProducts',
          entry: 'http://localhost:3001/remoteEntry.js',
        },
        {
          name: 'remoteCart',
          entry: 'http://localhost:3002/remoteEntry.js',
        },
      ],
    })
  }
})
```

**pages/products.vue:**
```vue
<script setup lang="ts">
import { getInstance, createInstance } from '@module-federation/runtime'
import { ref, onMounted } from 'vue'

const RemoteProductList = ref(null)

const loadRemoteComponent = async () => {
  let instance = getInstance()
  
  if (!instance) {
    instance = createInstance({
      name: 'host',
      remotes: [{
        name: 'remoteProducts',
        entry: 'http://localhost:3001/remoteEntry.js',
      }],
    })
  }
  
  const module = await instance.loadRemote('remoteProducts/ProductList')
  RemoteProductList.value = module.default || module
}

onMounted(() => {
  loadRemoteComponent()
})
</script>

<template>
  <component v-if="RemoteProductList" :is="RemoteProductList" />
</template>
```

### Remote Configuration (Products)

**Package.json dependencies:**
```json
{
  "devDependencies": {
    "@module-federation/vite": "1.10.0",
    "vite-plugin-top-level-await": "latest"
  }
}
```

**nuxt.config.ts:**
```typescript
import { federation } from '@module-federation/vite'
import TopAwait from 'vite-plugin-top-level-await'

export default defineNuxtConfig({
  ssr: false,
  
  nitro: {
    static: true, // Important!
  },
  
  routeRules: {
    '/remoteEntry.js': { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/javascript' 
      } 
    },
    '/_nuxt/**': { 
      headers: { 
        'Access-Control-Allow-Origin': '*' 
      } 
    },
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
            './ProductList': './components/ProductList.vue',
          },
          shared: {}, // Empty!
        }),
        TopAwait()
      )
    },
  },
})
```

**components/ProductList.vue:**
```vue
<template>
  <div>
    <!-- Your component -->
  </div>
</template>

<script setup lang="ts">
// Component logic
</script>
```

### Build Scripts

**Root package.json:**
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:watch": "./dev-watch.sh",
    "dev:host": "turbo run dev --filter=@microfrontends/host",
    "dev:remotes": "turbo run dev --filter=@microfrontends/remote-*",
    "build:all": "./build-all.sh",
    "build:host": "turbo run build --filter=@microfrontends/host",
    "build:remotes": "turbo run build --filter=@microfrontends/remote-*",
    "preview:all": "./preview-all.sh",
    "preview:host": "turbo run preview --filter=@microfrontends/host",
    "preview:remotes": "turbo run preview --filter=@microfrontends/remote-*"
  }
}
```

**dev-watch.sh:**
```bash
#!/bin/bash
# Build remotes first
cd apps/remote-products && pnpm build
cd ../remote-cart && pnpm build
cd ../../

# Start remotes in preview
cd apps/remote-products && pnpm preview &
cd ../remote-cart && pnpm preview &

# Start host in dev
cd ../host && pnpm dev
```

**build-all.sh:**
```bash
#!/bin/bash
# Build remotes
cd apps/remote-products && pnpm build
cd ../remote-cart && pnpm build

# Copy remoteEntry.js to .output/public
cp .nuxt/dist/client/remoteEntry.js .output/public/

# Build host
cd ../host && pnpm build
```

## Key Points

### ✅ What Works
- Host uses runtime API only (no Vite plugin)
- Remotes use Vite plugin for building
- `nitro.static: true` in remotes
- CORS via `routeRules` at root level
- `shared: {}` (empty shared config)
- `getInstance()` / `createInstance()` pattern
- `loadRemote()` for loading components

### ❌ What Doesn't Work
- ~~Using Vite plugin in host~~ (conflicts with runtime)
- ~~`shared` with dependencies~~ (causes app failures - use empty object)
- ~~`routeRules` inside `nitro` object~~ (must be at root)
- ~~`nitro.node-server` for remotes~~ (use `static`)
- ~~`import('remoteProducts/ProductList')` directly~~ (use `loadRemote()`)

### 🔑 Critical Details
1. **Empty shared config is required** - any shared deps cause failures
2. **CORS headers must be on routeRules at root level**
3. **remoteEntry.js must be copied to .output/public/** after build
4. **Host loads at runtime, not build time**
5. **Remotes must be built with static preset**

## Troubleshooting Checklist

- [ ] Is remote running? (Check http://localhost:3001)
- [ ] Is remoteEntry.js accessible? (Check http://localhost:3001/remoteEntry.js)
- [ ] Are CORS headers set? (Check Network tab in browser)
- [ ] Is remoteEntry.js returning JavaScript? (Not HTML)
- [ ] Is `shared: {}` empty in all configs?
- [ ] Is Federation Runtime initialized in plugin?
- [ ] Is `nitro.static: true` in remotes?
- [ ] Are `routeRules` at root level (not inside nitro)?

## Common Issues

### Remote returns HTML instead of JavaScript
**Fix**: Copy remoteEntry.js to .output/public/ after build

### "Cannot read properties of undefined"  
**Fix**: Check `module.default || module` pattern

### CORS errors
**Fix**: Verify `routeRules` at root level with CORS headers

### App crashes when adding shared dependencies
**Fix**: Use `shared: {}` (empty)

### remoteEntry.js 404
**Fix**: Ensure build script copies file to .output/public/

## Migration Notes

If migrating from an older setup:

1. Remove `@module-federation/vite` from host
2. Add `@module-federation/runtime` to host
3. Remove MF plugin from host's `nuxt.config.ts`
4. Add runtime initialization plugin
5. Update pages to use `getInstance()` and `loadRemote()`
6. Keep `@module-federation/vite` in remotes
7. Ensure remotes use `nitro.static: true`
8. Set all `shared: {}` to empty objects
9. Move `routeRules` to root level
