# Architecture Documentation

## Overview

This project uses a **microfrontends architecture** powered by **Module Federation** with **Webpack 5** to dynamically load remote applications at runtime.

## Key Technologies

- **Nuxt 3.14.159**: Vue 3 framework with SSR enabled (client-only remote loading)
- **Webpack 5.91.0**: Module bundler with @nuxt/webpack-builder
- **@module-federation/runtime 2.0.1**: Client-side runtime API (host only)
- **@module-federation/enhanced 2.0.1**: Enhanced webpack plugin (remotes only)
- **@module-federation/node 2.7.32**: Server-side federation support (host only)
- **Turborepo**: Monorepo orchestration
- **pnpm 8.15.0**: Package manager

## Architecture Pattern

### Host Application

**Role**: Consumer of remote microfrontends

**Configuration**:

- **Nuxt Builder**: Webpack (`@nuxt/webpack-builder`)
- **SSR**: Enabled (but remotes load client-only)
- **Federation Runtime**: `@module-federation/runtime` for client-side loading
- **Pattern**: Client-only loading via `onMounted()`

**Key Files**:

- `apps/host/nuxt.config.ts`: Webpack builder configuration
- `apps/host/utils/loadRemoteUniversal.ts`: Client-only remote loader
- `apps/host/pages/products.vue`: Loads `remoteProducts/ProductList` on client
- `apps/host/pages/cart.vue`: Loads `remoteCart/ShoppingCart` on client

**Loading Pattern** (Client-Only):

```typescript
// SSR Phase: Component shows loading state
// Client Phase: onMounted() triggers remote loading

import { onMounted } from 'vue'
import { loadRemoteComponentUniversal } from '../utils/loadRemoteUniversal'

const RemoteProductList = ref<Component | null>(null)
const isLoading = ref(true)

const loadRemoteComponent = async () => {
    const module = await loadRemoteComponentUniversal('remoteProducts', 'http://localhost:3001/remoteEntry.js', 'ProductList')
    RemoteProductList.value = markRaw(module.default || module)
    isLoading.value = false
}

// Client-only execution
onMounted(() => {
    loadRemoteComponent()
})
```

### Remote Applications

**Role**: Expose components for consumption by host

**Configuration**:

- **Build Tool**: Webpack 5 with standalone configs
- **Plugin**: `@module-federation/enhanced/webpack` 2.0.1
- **Dev Mode**: `webpack serve` with dev server on ports 3001/3002
- **Production**: Separate client and SSR builds (SSR optional)
- **CORS**: Enabled via webpack devServer headers

**Key Files**:

- `apps/remote-products/webpack.client.mjs`: Client-side federation config
- `apps/remote-products/webpack.ssr.mjs`: Server-side federation config (optional)
- `apps/remote-products/components/ProductList.vue`: Exposed component
- `apps/remote-cart/webpack.client.mjs`: Client-side federation config
- `apps/remote-cart/components/ShoppingCart.vue`: Exposed component

**Build Output**:

- `dist/remoteEntry.js`: Federation entry point (served by webpack-dev-server)
- `dist/remoteEntry.ssr.js`: SSR entry point (optional, for production)

**Federation Config Example** (`remote-products`):

```javascript
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack'

export default {
    plugins: [
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
        headers: { 'Access-Control-Allow-Origin': '*' }
    }
}
```

## Build Process

### Remote Build Flow

1. **Webpack Build**: Standalone webpack build (not integrated with Nuxt)
2. **Client Bundle**: `webpack --config webpack.client.mjs` → `dist/remoteEntry.js`
3. **SSR Bundle** (optional): `webpack --config webpack.ssr.mjs` → `dist/remoteEntry.ssr.js`
4. **Dev Mode**: `webpack serve` with watch + HMR on ports 3001/3002

### Host Build Flow

1. **Nuxt Build**: Standard Nuxt build with webpack builder
2. **Output**: `.output/` with server and client bundles
3. **Runtime**: Federation Runtime loads remotes at runtime (client-side only)
4. **SSR**: Server renders loading state, client loads actual components

### Development Workflow

**Starting All Servers**:

```bash
./dev-all.sh
# or
pnpm run dev:all
```

This starts:

- Remote Products: `webpack serve` on port 3001
- Remote Cart: `webpack serve` on port 3002
- Host: `nuxt dev` on port 3000

**SSR Behavior**:

- Server-side: Renders loading state ("Loading products...")
- Client-side: `onMounted()` triggers remote loading
- Result: Progressive enhancement with client-side federation

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
        }
    ]
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
- Reinstall: `rm -rf node_modules && pnpm install`
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
