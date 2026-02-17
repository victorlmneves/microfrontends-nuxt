# Troubleshooting Guide

Common issues and solutions for Module Federation with Nuxt 3 + Webpack.

---

## Remote Not Loading

### Symptoms

- Blank page or loading state never completes
- "Failed to load remote" error
- Component doesn't render

### Diagnostics

1. **Check if remote webpack server is running:**

    ```bash
    curl http://localhost:3001/remoteEntry.js
    ```

    Should return JavaScript code (not HTML).

2. **Check browser console:**
    - Open DevTools (F12)
    - Look for network errors or CORS errors

3. **Check Network tab:**
    - Is remoteEntry.js being fetched?
    - What's the response status?
    - Is Content-Type: application/javascript?

### Solutions

#### Remote webpack server not running

```bash
cd apps/remote-products
pnpm run dev:webpack
```

#### Port mismatch

Verify ports in:

- Host loader: `http://localhost:3001/remoteEntry.js`
- Remote webpack config: `devServer.port: 3001`
- Remote publicPath: `'http://localhost:3001/'`

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

## SSR vs Client Loading

### Understanding the behavior

**Current Setup:**

- SSR is **enabled** on the host
- Remote components load **client-only**

**What happens:**

1. **Server-side render**: Shows loading state ("Loading products...")
2. **Client hydration**: Mounts component
3. **onMounted() fires**: Loads remote via Module Federation
4. **Component renders**: Remote component replaces loading state

**Why client-only?**

- Module Federation in dev mode requires browser APIs
- Webpack dev server serves bundles in-memory
- SSR with MF requires complex build setup (production-only)

**When you see loading state:**
This is **normal and expected** in SSR mode. The HTML source will show:

```html
<div class="loading">Loading products...</div>
```

Then JavaScript takes over and loads the actual component.

**To verify it's working:**

1. Open browser DevTools
2. Network tab should show `remoteEntry.js` loading
3. Component should render after ~100-500ms

---

## Port Configuration

### Verify all ports are correct

**Check webpack configs:**

```javascript
// remote-products/webpack.client.mjs
export default {
  output: {
    publicPath: 'http://localhost:3001/',  // Must match port
  },
  devServer: {
    port: 3001  // Must match publicPath
  }
}

// remote-cart/webpack.client.mjs
export default {
  output: {
    publicPath: 'http://localhost:3002/',
  },
  devServer: {
    port: 3002
  }
}
```

**Check host configuration:**

```typescript
// In pages/products.vue
const remoteEntry = 'http://localhost:3001/remoteEntry.js' // Port 3001

// In pages/cart.vue
const remoteEntry = 'http://localhost:3002/remoteEntry.js' // Port 3002
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

# For remotes (webpack dependencies)
cd apps/remote-products
pnpm add -D webpack webpack-cli webpack-dev-server
pnpm add -D @module-federation/enhanced
```

---

## Stale Cache / Changes Not Reflected

### Symptoms

- Changes not reflected
- Old code running
- Build errors after config changes

### Solution

**Clear all caches:**

```bash
# Kill all processes
pkill -9 -f "webpack"
pkill -9 -f "nuxt"

# Clear Nuxt cache
rm -rf apps/host/.nuxt apps/host/.output
rm -rf apps/*/dist

# Restart
./dev-all.sh
```

**Clear browser cache:**

- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or open DevTools → Network → Disable cache

---

## Build Errors

### "Failed to resolve import"

**Problem:** Webpack trying to resolve dynamic import incorrectly.

**Solution:** Use `loadRemote()`:

```typescript
const module = await instance.loadRemote('remoteProducts/ProductList')
```

### "Module not found"

**Problem:** Webpack cannot find external modules.

**Solution:** Add to host's `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
    webpack: {
        externals: {
            '@module-federation/node': 'commonjs @module-federation/node'
        }
    },
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

1. Use `./dev-all.sh` for individual webpack dev servers
2. Each remote has its own webpack-dev-server with fast HMR
3. Host uses Nuxt's built-in HMR

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
- [ ] Are CORS headers set in webpack devServer? (check Network tab)
- [ ] Is Federation Runtime initialized? (check plugin)
- [ ] Is Vue shared as singleton? (check webpack configs)
- [ ] Are webpack dev servers running on correct ports?
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
