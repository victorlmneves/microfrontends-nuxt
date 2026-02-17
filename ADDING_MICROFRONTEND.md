# Adding a New Microfrontend

This guide walks through adding a new microfrontend to the monorepo.

## Example: Adding a "Reviews" Microfrontend

### Step 1: Create the App Directory

```bash
mkdir apps/remote-reviews
cd apps/remote-reviews
```

### Step 2: Create package.json

Create `apps/remote-reviews/package.json`:

```json
{
    "name": "@microfrontends/remote-reviews",
    "version": "1.0.0",
    "private": true,
    "scripts": {
        "dev": "nuxt dev --port 3003",
        "dev:webpack": "webpack serve --config webpack.client.mjs --port 3003",
        "build:nuxt": "nuxt build",
        "build:webpack": "webpack --config webpack.client.mjs",
        "postinstall": "nuxt prepare"
    },
    "dependencies": {
        "nuxt": "3.14.159",
        "vue": "3.5.13"
    },
    "devDependencies": {
        "@module-federation/enhanced": "2.0.1",
        "@nuxt/devtools": "1.6.4",
        "@nuxt/webpack-builder": "4.3.1",
        "@types/node": "25.2.3",
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

**Important**: Choose a unique port (3003 in this case).

### Step 3: Create nuxt.config.ts

Create `apps/remote-reviews/nuxt.config.ts` (minimal - for type generation only):

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

### Step 3b: Create webpack.client.mjs

Create `apps/remote-reviews/webpack.client.mjs` (main configuration):

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
        publicPath: 'http://localhost:3003/',
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
                test: /\.(ts|tsx)$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                },
                exclude: /node_modules/
            },
            {
                test: /\.m?js$/,
                type: 'javascript/auto'
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
            name: 'remoteReviews',
            filename: 'remoteEntry.js',
            exposes: {
                './ReviewsList': './components/ReviewsList.vue'
            },
            shared: {
                vue: {
                    singleton: true,
                    requiredVersion: false
                }
            },
            dts: false
        })
    ],
    devServer: {
        port: 3003,
        hot: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        },
        allowedHosts: 'all'
    }
}
```

### Step 4: Create the Component

Create `apps/remote-reviews/components/ReviewsList.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Review {
    id: number
    author: string
    rating: number
    comment: string
    date: string
}

const reviews = ref<Review[]>([
    {
        id: 1,
        author: 'John Doe',
        rating: 5,
        comment: 'Excellent product! Highly recommended.',
        date: '2024-01-15'
    },
    {
        id: 2,
        author: 'Jane Smith',
        rating: 4,
        comment: 'Good quality, fast delivery.',
        date: '2024-01-14'
    }
])

const renderStars = (rating: number): string => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
    <div class="reviews-list">
        <div class="remote-badge">⭐ Remote: Reviews Microfrontend</div>

        <div class="reviews-container">
            <div v-for="review in reviews" :key="review.id" class="review-card">
                <div class="review-header">
                    <h3 class="author-name">{{ review.author }}</h3>
                    <span class="review-date">{{ review.date }}</span>
                </div>
                <div class="rating">
                    {{ renderStars(review.rating) }}
                </div>
                <p class="review-comment">{{ review.comment }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.reviews-list {
    width: 100%;
}

.remote-badge {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    display: inline-block;
    margin-bottom: 2rem;
    font-weight: 600;
    box-shadow: 0 4px 6px rgba(240, 147, 251, 0.3);
}

.reviews-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.review-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.review-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.author-name {
    margin: 0;
    color: #333;
    font-size: 1.2rem;
}

.review-date {
    color: #888;
    font-size: 0.9rem;
}

.rating {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.review-comment {
    color: #555;
    line-height: 1.6;
    margin: 0;
}
</style>
```

### Step 5: Create app.vue (Standalone)

Create `apps/remote-reviews/app.vue`:

```vue
<script setup lang="ts">
// Remote Reviews standalone app
</script>

<template>
    <div class="remote-app">
        <header class="remote-header">
            <h1>⭐ Reviews Microfrontend</h1>
            <p>This is a standalone remote application</p>
        </header>

        <main class="remote-main">
            <ReviewsList />
        </main>
    </div>
</template>

<style scoped>
.remote-app {
    min-height: 100vh;
    background: #f8f9fa;
}

.remote-header {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    padding: 2rem;
    text-align: center;
}

.remote-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
}

.remote-header p {
    margin: 0;
    opacity: 0.9;
}

.remote-main {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}
</style>
```

### Step 6: Configure Host to Load the Remote

The host uses runtime API to load remotes dynamically. No configuration changes needed in `nuxt.config.ts`.

### Step 7: Create Reviews Page in Host

Create `apps/host/pages/reviews.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted, markRaw, type Component } from 'vue'
import { loadRemoteComponentUniversal } from '../utils/loadRemoteUniversal'
import { loadRemoteStyles } from '../utils/loadRemoteCSS'

const RemoteReviewsList = ref<Component | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(true)

const loadRemoteComponent = async () => {
    try {
        // Load CSS first
        await loadRemoteStyles('http://localhost:3003')

        // Load the component
        const module = await loadRemoteComponentUniversal('remoteReviews', 'http://localhost:3003/remoteEntry.js', 'ReviewsList')

        RemoteReviewsList.value = markRaw(module.default || module)
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
    <div class="reviews-page">
        <h2>Product Reviews</h2>
        <p class="info">This component is loaded from the remote Reviews microfrontend</p>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading">
            <p>Loading reviews...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error">
            <p>Failed to load reviews: {{ error }}</p>
            <button @click="loadRemoteComponent">Retry</button>
        </div>

        <!-- Remote Component -->
        <component v-else-if="RemoteReviewsList" :is="RemoteReviewsList" />
    </div>
</template>

<style scoped>
.reviews-page h2 {
    color: #333;
    margin-bottom: 1rem;
}

.info {
    background: #fce4ec;
    padding: 1rem;
    border-radius: 4px;
    border-left: 4px solid #f06292;
    margin-bottom: 2rem;
    color: #880e4f;
}

.loading {
    text-align: center;
    padding: 3rem;
    color: #666;
    font-size: 1.2rem;
}

.error {
    background: #ffebee;
    padding: 2rem;
    border-radius: 4px;
    border-left: 4px solid #f44336;
    color: #c62828;
}

.error button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>
```

Update `apps/host/app.vue`:

```vue
<script setup lang="ts">
// Main host application component
</script>

<template>
    <div class="app-container">
        <header class="app-header">
            <h1>Microfrontends Demo - Host App</h1>
            <nav class="app-nav">
                <NuxtLink to="/">Home</NuxtLink>
                <NuxtLink to="/products">Products</NuxtLink>
                <NuxtLink to="/cart">Cart</NuxtLink>
                <NuxtLink to="/reviews">Reviews</NuxtLink>
                <!-- ADD THIS -->
            </nav>
        </header>

        <main class="app-main">
            <NuxtPage />
        </main>

        <footer class="app-footer">
            <p>&copy; 2024 Microfrontends Demo</p>
        </footer>
    </div>
</template>

<!-- styles remain the same -->
```

### Step 8: Add Navigation in Host

From the root:

```bash
pnpm install
```

### Step 10: Test the New Microfrontend

Start all apps:

```bash
# Update dev-all.sh to include the new remote
# Or start individually:

# Terminal 1 - Remote Reviews
cd apps/remote-reviews && pnpm dev:webpack

# Terminal 2 - Remote Products
cd apps/remote-products && pnpm dev:webpack

# Terminal 3 - Remote Cart
cd apps/remote-cart && pnpm dev:webpack

# Terminal 4 - Host
cd apps/host && pnpm dev
```

**Test Points**:

1. Standalone: http://localhost:3003 - Should show Reviews app
2. Integrated: http://localhost:3000/reviews - Should load ReviewsList from remote
3. Browser DevTools Network tab - Should see remoteEntry.js loaded from port 3003
   npm run dev

```

You should now see:

- Host: http://localhost:3000
- Products: http://localhost:3001
- Cart: http://localhost:3002
- **Reviews: http://localhost:3003** (NEW!)

Visit http://localhost:3000/reviews to see the new microfrontend in action!

## Checklist for Adding a New Microfrontend

- [ ] Create new directory in `apps/`
- [ ] Add `package.json` with unique port
- [ ] Create `nuxt.config.ts` with Module Federation config
- [ ] Define `exposes` for components to share
- [ ] Create the component(s) to expose
- [ ] Create standalone `app.vue` for independent running
- [ ] Update host's `nuxt.config.ts` remotes
- [ ] Create page in host to consume the remote
- [ ] Add navigation link in host
- [ ] Run `npm install` from root
- [ ] Test in both standalone and integrated modes

## Best Practices

1. **Port Management**: Use a consistent port numbering scheme
    - Host: 3000
    - First remote: 3001
    - Second remote: 3002
    - Third remote: 3003, etc.

2. **Naming Conventions**:
    - App name: `remote-{feature}`
    - Remote name: `remote{Feature}` (camelCase)
    - Package name: `@microfrontends/remote-{feature}`

3. **Component Exposure**:
    - Only expose what's necessary
    - Use clear, descriptive names
    - Document what each exposed component does

4. **Error Handling**:
    - Always wrap remote imports in try-catch
    - Provide meaningful fallback UI
    - Log errors for debugging

5. **Testing**:
    - Test each remote standalone first
    - Test integration with host
    - Test error scenarios (remote down, network issues)

## Production Considerations

When deploying the new microfrontend to production:

1. **Update Remote URLs**: Change from localhost to production URLs
2. **Environment Variables**: Use env vars for remote entries
3. **Versioning**: Version the exposed components
4. **Caching**: Configure appropriate cache headers
5. **Monitoring**: Add error tracking and performance monitoring
```
