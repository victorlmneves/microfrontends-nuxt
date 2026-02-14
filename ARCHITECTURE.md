# Architecture Documentation

## Overview

This project uses a **microfrontends architecture** powered by **Module Federation Runtime** to dynamically load remote applications at runtime.

## Key Technologies

- **Nuxt 3.21.1**: Vue 3 framework (SSR disabled for SPA mode)
- **@module-federation/runtime 2.0.1**: Runtime API for loading remotes (host only)
- **@module-federation/vite 1.10.0**: Vite plugin for building remotes (remotes only)  
- **vite-plugin-top-level-await**: Enables top-level await in remotes
- **Turborepo**: Monorepo orchestration
- **pnpm 8.15.0**: Package manager

## Architecture Pattern

### Host Application

**Role**: Consumer of remote microfrontends

**Configuration**:
- No Vite Module Federation plugin
- Uses `@module-federation/runtime` directly
- SSR disabled (`ssr: false`)
- Loads remotes dynamically via `loadRemote()`

**Key Files**:
- `apps/host/plugins/01.mf-runtime.client.ts`: Initializes Federation Runtime with `createInstance()`
- `apps/host/pages/products.vue`: Loads `remoteProducts/ProductList`
- `apps/host/pages/cart.vue`: Loads `remoteCart/ShoppingCart`

**Loading Pattern**:
```typescript
import { getInstance, createInstance } from '@module-federation/runtime'

// Get or create instance
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

// Load remote component
const module = await instance.loadRemote('remoteProducts/ProductList')
const component = module.default || module
```

### Remote Applications

**Role**: Expose components for consumption by host

**Configuration**:
- Uses `@module-federation/vite` 1.10.0 plugin
- Uses `vite-plugin-top-level-await`
- Nitro preset: **static** (generates static files)
- SSR disabled (`ssr: false`)
- CORS headers configured via `routeRules`

**Key Files**:
- `apps/remote-products/nuxt.config.ts`: Exposes `./ProductList`
- `apps/remote-products/components/ProductList.vue`: Exposed component
- `apps/remote-cart/nuxt.config.ts`: Exposes `./ShoppingCart`
- `apps/remote-cart/components/ShoppingCart.vue`: Exposed component

**Build Output**:
- `.nuxt/dist/client/remoteEntry.js`: Federation entry point
- `.output/public/`: Static files (remoteEntry.js copied here via build script)

**Federation Config Example** (`remote-products`):
```typescript
{
  name: 'remoteProducts',
  filename: 'remoteEntry.js',
  exposes: {
    './ProductList': './components/ProductList.vue',
  },
  shared: {}, // Empty - important!
}
```

## Build Process

### Remote Build Flow

1. **Vite Build**: Nuxt builds the app with Module Federation plugin
2. **Output**: `.nuxt/dist/client/remoteEntry.js` + chunks
3. **Copy**: Build script copies `remoteEntry.js` to `.output/public/`
4. **Serve**: Static preview server serves `.output/public/`

### Host Build Flow

1. **Vite Build**: Standard Nuxt build (no MF plugin)
2. **Output**: `.output/` with server and client bundles
3. **Runtime**: Federation Runtime loads remotes at runtime (not build time)

## Communication Flow

```
1. User visits http://localhost:3000/products
   ↓
2. Host (Nuxt) renders products.vue
   ↓
3. onMounted() calls loadRemoteComponent()
   ↓
4. getInstance() retrieves Federation Runtime instance
   ↓
5. instance.loadRemote('remoteProducts/ProductList')
   ↓
6. Runtime fetches http://localhost:3001/remoteEntry.js
   ↓
7. remoteEntry.js loads and initializes container
   ↓
8. Runtime calls container.get('./ProductList')
   ↓
9. Component factory returns Vue component
   ↓
10. Host renders component in <component :is="...">
```

## CORS Configuration

### Remotes (required)

```typescript
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
}
```

### Host

```typescript
vite: {
  server: {
    cors: true,
  },
}
```

## Deployment Considerations

### Remotes
- Build with `nuxt build`
- Deploy `.output/public/` to static hosting (Netlify, Vercel, S3, etc.)
- Ensure `remoteEntry.js` is at root of public URL
- CORS headers must be configured on server/CDN

### Host
- Build with `nuxt build`
- Deploy `.output/` to Node.js server or Vercel
- Update remote URLs in `plugins/01.mf-runtime.client.ts` to production URLs
- No CORS needed (runtime fetches from remotes)

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.production
VITE_REMOTE_PRODUCTS_URL=https://products.example.com
VITE_REMOTE_CART_URL=https://cart.example.com
```

Update plugin:
```typescript
createInstance({
  name: 'host',
  remotes: [
    { 
      name: 'remoteProducts', 
      entry: `${import.meta.env.VITE_REMOTE_PRODUCTS_URL}/remoteEntry.js` 
    },
  ],
})
```

## Shared Dependencies

Currently using **empty shared config** (`shared: {}`) in all apps.

**Why?**
- Simplifies setup
- Each remote bundles its own dependencies
- No version conflicts
- Slightly larger bundle sizes (trade-off)

**Alternative (recommended for production)**:
Share common dependencies like Vue:

```typescript
shared: {
  vue: {
    singleton: true,
    requiredVersion: '^3.5.0',
  },
}
```

## Troubleshooting

### Remote not loading
1. Check remote is running and accessible
2. Verify `http://localhost:3001/remoteEntry.js` returns JavaScript
3. Check browser console for CORS/network errors
4. Verify CORS headers in remote's `nuxt.config.ts`

### "Cannot read properties of undefined"
- Remote component not exported correctly
- Check `module.default || module` pattern in host
- Verify component in remote is a valid Vue component

### Build errors
- Clear `.nuxt` caches: `rm -rf apps/*/.nuxt`
- Reinstall:  `rm -rf node_modules && pnpm install`
- Check Vite/Nuxt version compatibility

## Performance Optimization

### Code Splitting
- Each remote handles its own code splitting
- Host loads remotes on-demand (lazy loading)
- Use `defineAsyncComponent` for even lazier loading if needed

### Caching
- Set proper cache headers on `remoteEntry.js` (short TTL)
- Set long cache on chunks (immutable)
- Use CDN for remotes

### Preloading
```typescript
// Preload remote when hovering over link
<NuxtLink 
  to="/products" 
  @mouseenter="preloadProducts"
>
  Products
</NuxtLink>

const preloadProducts = () => {
  instance.loadRemote('remoteProducts/ProductList')
}
```

## Security

- `shared: {}` means no shared scope access between remotes
- Each remote is isolated
- Host controls which remotes to load
- Use SRI (Subresource Integrity) in production
- Validate remote URLs before loading
- Consider CSP (Content Security Policy) headers

## Next Steps

- Add authentication/authorization  
- Implement shared state (Pinia store)
- Add error boundaries
- Implement loading skeletons
- Add E2E tests with Playwright
- Set up CI/CD pipelines
