# Troubleshooting Guide

Common issues and solutions for Module Federation with Nuxt 3.

---

## Remote Not Loading

### Symptoms

- Blank page or loading state never completes
- "Failed to load remote" error
- Component doesn't render

### Diagnostics

1. **Check if remote is running:**

    ```bash
    curl http://localhost:3001
    ```

2. **Check if remoteEntry.js is accessible:**

    ```bash
    curl http://localhost:3001/remoteEntry.js
    ```

    Should return JavaScript code (not HTML).

3. **Check browser console:**
    - Open DevTools (F12)
    - Look for network errors or CORS errors

4. **Check Network tab:**
    - Is remoteEntry.js being fetched?
    - What's the response status?
    - What's the Content-Type header?

### Solutions

#### Remote not running

```bash
# Start the remote
cd apps/remote-products
pnpm build && pnpm preview
# Or in dev mode:
pnpm dev
```

#### remoteEntry.js returns HTML (404 page)

**Problem:** Nitro serves index.html for all unknown routes

**Fix:** Ensure build script copies remoteEntry.js:

```bash
# In remote's build process
cp .nuxt/dist/client/remoteEntry.js .output/public/
```

Add to `package.json`:

```json
{
    "scripts": {
        "build": "nuxt build && cp .nuxt/dist/client/remoteEntry.js .output/public/"
    }
}
```

#### CORS errors

**Fix 1:** Add CORS headers in remote's `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
    routeRules: {
        // Must be at root level!
        '/remoteEntry.js': {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/javascript'
            }
        },
        '/_nuxt/**': {
            headers: { 'Access-Control-Allow-Origin': '*' }
        }
    }
})
```

**Fix 2:** Ensure `routeRules` is NOT inside `nitro` object:

```typescript
// ❌ Wrong
export default defineNuxtConfig({
    nitro: {
        routeRules: {
            /* ... */
        } // Won't work!
    }
})

// ✅ Correct
export default defineNuxtConfig({
    routeRules: {
        /* ... */
    } // At root level
})
```

---

## "Cannot read properties of undefined"

### Symptoms

- TypeError in console
- Component doesn't render
- "Cannot read properties of undefined (reading 'default')" or similar

### Cause

Component not exported correctly or loadRemote returns unexpected format.

### Solution

Use defensive coding in component loading:

```typescript
const module = await instance.loadRemote('remoteProducts/ProductList')
const component = (module as any).default || module
RemoteProductList.value = component
```

Also check your remote component exports correctly:

```vue
<!-- components/ProductList.vue -->
<template>
    <div>Product List</div>
</template>

<script setup lang="ts">
// No explicit export needed - auto-exported
</script>
```

---

## App Crashes with Shared Dependencies

### Symptoms

- App crashes/freezes on load
- White screen
- Infinite loading
- Console shows federation errors

### Cause

Shared dependencies configuration causing conflicts.

### Solution

Use **empty shared config**:

```typescript
federation({
    name: 'remoteProducts',
    exposes: {
        /* ... */
    },
    shared: {} // ✅ Empty!
})
```

**Never** use:

```typescript
shared: {  // ❌ Causes crashes
  vue: { singleton: true },
  'vue-router': { singleton: true },
}
```

---

## Federation Runtime Not Initialized

### Symptoms

- Error: "Please call createInstance first"
- Error: "#RUNTIME-009"
- Error: "Federation Runtime not initialized"

### Cause

Host doesn't have Federation Runtime initialized.

### Solution

Create plugin `apps/host/plugins/01.mf-runtime.client.ts`:

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
                    entry: 'http://localhost:3001/remoteEntry.js'
                },
                {
                    name: 'remoteCart',
                    entry: 'http://localhost:3002/remoteEntry.js'
                }
            ]
        })
    }
})
```

---

## Port Already in Use

### Symptoms

- Error: "EADDRINUSE: address already in use :::3000"
- Server won't start

### Solution

Find and kill the process:

**macOS/Linux:**

```bash
# Find process
lsof -ti:3000

# Kill it
lsof -ti:3000 | xargs kill -9

# Or kill all ports at once
npx kill-port 3000 3001 3002
```

**Windows:**

```cmd
# Find process
netstat -ano | findstr :3000

# Kill by PID
taskkill /PID <PID> /F
```

---

## Dependencies Not Found

### Symptoms

- Module not found errors
- Import errors
- "@module-federation/runtime" not found

### Solution

Reinstall dependencies:

```bash
# Clean everything
rm -rf node_modules apps/*/node_modules

# Reinstall
pnpm install
```

If specific package is missing:

```bash
# For host
cd apps/host
pnpm add @module-federation/runtime

# For Module Federation build dependencies (in monorepo root)
cd /Users/victorneves/_code/microfrontends-nuxt
pnpm add -D @module-federation/vite vite-plugin-top-level-await
```

> **Note**: In this monorepo setup, `@module-federation/vite` and `vite-plugin-top-level-await` are installed in the root package.json and shared via pnpm workspace hoisting. Individual remotes don't need them in their package.json.

---

## Stale Nuxt Cache

### Symptoms

- Changes not reflected
- Old code running
- Build errors after config changes

### Solution

Clear Nuxt caches:

```bash
# Clear all .nuxt directories
rm -rf apps/host/.nuxt
rm -rf apps/remote-products/.nuxt
rm -rf apps/remote-cart/.nuxt

# Then restart
pnpm run dev:watch
```

---

## Build Errors

### "Failed to resolve import"

**Problem:** Vite trying to resolve remote import at build time.

**Solution:** Use `/* @vite-ignore */` comment:

```typescript
const module = await import(
    /* @vite-ignore */
    '/remote-products/remoteEntry.js'
)
```

Or better, use `loadRemote()`:

```typescript
const module = await instance.loadRemote('remoteProducts/ProductList')
```

### "Rollup failed to resolve import"

**Problem:** External modules not excluded from bundle.

**Solution:** Add to host's `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
    vite: {
        optimizeDeps: {
            exclude: ['@module-federation/runtime']
        }
    }
})
```

---

## Performance Issues

### Slow Startup

**Problem:** All apps in dev mode slow to start.

**Solution:** Use hybrid mode:

```bash
pnpm run dev:watch
```

This builds remotes once and runs them in preview mode (faster).

### Slow HMR

**Problem:** Hot reload takes too long.

**Solution:**

1. Use `dev:watch` (remotes don't need HMR)
2. Reduce number of watched files
3. Exclude large directories from Vite config

---

## Production Deployment Issues

### remoteEntry.js Not Found in Production

**Problem:** 404 on production URLs.

**Check:**

1. Is file copied to `.output/public/`?
2. Is CDN/server serving `.output/public/` correctly?
3. Are paths correct in runtime config?

**Fix:** Update URLs in plugin:

```typescript
const instance = createInstance({
    name: 'host',
    remotes: [
        {
            name: 'remoteProducts',
            entry: 'https://products.myapp.com/remoteEntry.js' // Production URL
        }
    ]
})
```

### CORS in Production

**Problem:** CORS blocks production fetches.

**Solution:** Configure CDN/server headers:

**Netlify (\_headers file):**

```
/remoteEntry.js
  Access-Control-Allow-Origin: *
  Content-Type: application/javascript

/_nuxt/*
  Access-Control-Allow-Origin: *
```

**Vercel (vercel.json):**

```json
{
    "headers": [
        {
            "source": "/remoteEntry.js",
            "headers": [
                { "key": "Access-Control-Allow-Origin", "value": "*" },
                { "key": "Content-Type", "value": "application/javascript" }
            ]
        }
    ]
}
```

---

## TypeScript Errors

### "Cannot find module 'remoteProducts/ProductList'"

**Problem:** TypeScript doesn't know about remote modules.

**Solution:** This is expected! Use type casting:

```typescript
const module = (await instance.loadRemote('remoteProducts/ProductList')) as any
```

Or create type declarations (advanced):

```typescript
// types/remotes.d.ts
declare module 'remoteProducts/ProductList' {
    const ProductList: Component
    export default ProductList
}
```

---

## Quick Diagnostic Checklist

Run through this list when debugging:

- [ ] Is remote running? (`curl http://localhost:3001`)
- [ ] Is remoteEntry.js accessible? (`curl http://localhost:3001/remoteEntry.js`)
- [ ] Does remoteEntry.js return JavaScript? (not HTML)
- [ ] Are CORS headers set? (check Network tab)
- [ ] Is Federation Runtime initialized? (check plugin)
- [ ] Is `shared: {}` empty? (check all configs)
- [ ] Is `nitro.static: true` in remotes?
- [ ] Are `routeRules` at root level? (not in nitro)
- [ ] No TypeScript errors blocking build?
- [ ] Browser console clear of errors?
- [ ] Network tab shows successful fetches?

---

## Still Having Issues?

1. **Check browser console** for detailed error messages
2. **Check Network tab** to see what's being fetched
3. **Compare your config** with [FINAL-CONFIG.md](./FINAL-CONFIG.md)
4. **Try production build** (`./test-build.sh`) to rule out dev-mode issues
5. **Check versions** match recommended versions in SETUP-NEW.md

---

## Getting Help

When asking for help, include:

1. **Error message** (full text from console)
2. **Network tab** screenshot showing failed request
3. **Your config** (nuxt.config.ts, package.json)
4. **Steps to reproduce**
5. **Versions** (node, pnpm, nuxt, etc.)
