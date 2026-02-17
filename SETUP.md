# Setup Guide - Module Federation with Nuxt 3

## Current Configuration Summary

### Versions

- Nuxt: 3.14.159
- Vue: 3.5.13
- Webpack: 5.91.0
- @nuxt/webpack-builder: 4.3.1
- @module-federation/runtime: 2.0.1 (host only)
- @module-federation/enhanced: 2.0.1 (remotes only)
- @module-federation/node: 2.7.32 (host SSR support)
- pnpm: 8.15.0

### Host Configuration

**Package.json dependencies:**

```json
{
    "dependencies": {
        "@module-federation/node": "2.7.32",
        "@module-federation/runtime": "2.0.1",
        "nuxt": "3.14.159",
        "vue": "3.5.13"
    },
    "devDependencies": {
        "@nuxt/webpack-builder": "4.3.1",
        "typescript": "5.6.3",
        "vue-tsc": "2.1.10"
    }
}
```

**nuxt.config.ts:**

```typescript
export default defineNuxtConfig({
    ssr: true, // SSR enabled

    builder: 'webpack', // Use webpack instead of Vite

    webpack: {
        externals: {
            '@module-federation/node': 'commonjs @module-federation/node'
        }
    },

    vite: {
        server: {
            cors: true
        }
    }
})
```

**utils/loadRemoteUniversal.ts:**

```typescript
// Client-only federation loader for Nuxt 3
export async function loadRemoteComponentUniversal(
    remoteName: string,
    remoteEntry: string,
    exposedModule: string
): Promise<Record<string, unknown>> {
    if (typeof window === 'undefined') {
        throw new Error('This loader is client-only. Use onMounted() to call it.')
    }

    const runtime = await import('@module-federation/runtime')
    const getInstance = runtime.getInstance
    const createInstance = runtime.createInstance
    let instance = getInstance()

    if (instance) {
        instance.registerRemotes([{ name: remoteName, entry: remoteEntry }])
    } else {
        instance = createInstance({
            name: 'host',
            remotes: [{ name: remoteName, entry: remoteEntry }]
        })
    }

    const module = await instance.loadRemote(`${remoteName}/${exposedModule}`)
    return (module.default || module) as Record<string, unknown>
}
```

**pages/products.vue:**

```vue
<script setup lang="ts">
import { ref, onMounted, markRaw, type Component } from 'vue'
import { loadRemoteComponentUniversal } from '../utils/loadRemoteUniversal'
import { loadRemoteStyles } from '../utils/loadRemoteCSS'

const RemoteProductList = ref<Component | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(true)

const loadRemoteComponent = async () => {
    try {
        await loadRemoteStyles('http://localhost:3001')

        const module = await loadRemoteComponentUniversal('remoteProducts', 'http://localhost:3001/remoteEntry.js', 'ProductList')

        RemoteProductList.value = markRaw(module.default || module)
        isLoading.value = false
    } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : 'Failed to load'
        isLoading.value = false
    }
}

// Client-only loading
onMounted(() => {
    loadRemoteComponent()
})
</script>

<template>
    <div>
        <div v-if="isLoading">Loading products...</div>
        <div v-else-if="error">Error: {{ error }}</div>
        <component v-else-if="RemoteProductList" :is="RemoteProductList" />
    </div>
</template>
```

### Remote Configuration (Products)

**Package.json dependencies:**

```json
{
    "dependencies": {
        "nuxt": "3.14.159",
        "vue": "3.5.13"
    },
    "devDependencies": {
        "@module-federation/enhanced": "2.0.1",
        "@nuxt/webpack-builder": "4.3.1",
        "@vue/compiler-sfc": "3",
        "css-loader": "7.1.3",
        "sass": "1.97.3",
        "sass-loader": "16.0.7",
        "ts-loader": "9.5.4",
        "typescript": "5.6.3",
        "vue-loader": "17",
        "vue-style-loader": "4.1.3",
        "webpack": "5.91.0",
        "webpack-cli": "5.1.4",
        "webpack-dev-server": "5.0.4"
    }
}
```

**nuxt.config.ts** (minimal - Nuxt not used in production):

```typescript
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    builder: 'webpack',
    ssr: true,
    app: {
        baseURL: '/'
    }
})
```

**webpack.client.mjs** (main config):

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
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                    transpileOnly: true
                }
            },
            {
                test: /\.scss$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader']
            }
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
                vue: {
                    singleton: true,
                    requiredVersion: '3.5.13'
                }
            }
        })
    ],
    devServer: {
        port: 3001,
        hot: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        }
    }
}
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

**Remote package.json scripts:**

```json
{
    "scripts": {
        "dev:webpack": "webpack serve --config webpack.client.mjs --port 3001",
        "build:webpack": "webpack --config webpack.client.mjs"
    }
}
```

**dev-all.sh** (recommended for development):

```bash
#!/bin/bash
echo "🚀 Starting all dev servers..."

# Start remote-products (webpack) on port 3001
cd apps/remote-products && pnpm dev:webpack > /tmp/remote-products.log 2>&1 &

# Start remote-cart (webpack) on port 3002
cd ../remote-cart && pnpm dev:webpack > /tmp/remote-cart.log 2>&1 &

# Start host (Nuxt) on port 3000
cd ../host && pnpm dev > /tmp/host.log 2>&1 &

wait
```

**Starting development:**

```bash
# Start all servers
./dev-all.sh

# Or start individually:
cd apps/remote-products && pnpm dev:webpack  # Port 3001
cd apps/remote-cart && pnpm dev:webpack      # Port 3002
cd apps/host && pnpm dev                      # Port 3000
```

## Key Points

### ✅ What Works

- **Host**: Nuxt 3 with webpack builder + @module-federation/runtime (client-only)
- **Remotes**: Standalone webpack with @module-federation/enhanced plugin
- **Pattern**: Client-only loading via `onMounted()` - SSR renders loading state
- **CORS**: Enabled via webpack devServer headers
- **Shared**: Vue as singleton to avoid version conflicts
- **Development**: `webpack serve` for remotes, `nuxt dev` for host

### ❌ What Doesn't Work

- ~~SSR rendering of remote components~~ (client-only pattern working)
- ~~@module-federation/vite~~ (removed after switching to webpack)
- ~~Babel transpilation~~ (using ts-loader instead)
- ~~Server-side Module Federation in dev~~ (complex, not implemented)

### 🔑 Critical Details

1. **Remotes need standalone webpack** - Must have webpack, webpack-cli, webpack-dev-server
2. **Host uses Nuxt's webpack** - No standalone webpack needed in host
3. **Client-only loading** - Components load via `onMounted()`, not during SSR
4. **Vue singleton is critical** - Prevents version mismatch errors
5. **CORS headers required** - Webpack devServer must allow cross-origin requests
6. **remoteEntry.js must be copied to .output/public/** after build
7. **Host loads at runtime, not build time**
8. **Remotes must be built with static preset**

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
