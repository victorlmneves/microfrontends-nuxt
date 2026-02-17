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
    "type": "module",
    "scripts": {
        "dev": "nuxt dev --port 3003",
        "build": "nuxt build",
        "generate": "nuxt generate",
        "preview": "nuxt preview",
        "postinstall": "nuxt prepare"
    },
    "dependencies": {
        "nuxt": "3.19.0",
        "vue": "3.5.13"
    }
}
```

> **Note**: Development and build tools (`@module-federation/vite`, `vite-plugin-top-level-await`, `@nuxt/devtools`, `typescript`, `vue-tsc`) are installed in the root package.json and shared via pnpm workspace hoisting. Individual remotes only need to declare their runtime dependencies (`nuxt`, `vue`).

````

**Important**: Choose a unique port (3003 in this case).

### Step 3: Create nuxt.config.ts

Create `apps/remote-reviews/nuxt.config.ts`:

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import federation from '@module-federation/vite'

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },

    ssr: false,

    vite: {
        plugins: [
            federation({
                name: 'remoteReviews',
                filename: 'remoteEntry.js',
                exposes: {
                    './ReviewsList': './components/ReviewsList.vue'
                },
                shared: {
                    vue: {
                        singleton: true,
                        requiredVersion: '^3.5.0'
                    }
                }
            })
        ],
        build: {
            target: 'esnext',
            minify: false
        }
    }
})
````

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

### Step 6: Configure Host to Consume the Remote

Update `apps/host/nuxt.config.ts`:

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import federation from '@module-federation/vite'

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },

    ssr: false,

    vite: {
        plugins: [
            federation({
                name: 'host',
                remotes: {
                    remoteProducts: {
                        type: 'module',
                        name: 'remoteProducts',
                        entry: 'http://localhost:3001/remoteEntry.js',
                        entryGlobalName: 'remoteProducts',
                        shareScope: 'default'
                    },
                    remoteCart: {
                        type: 'module',
                        name: 'remoteCart',
                        entry: 'http://localhost:3002/remoteEntry.js',
                        entryGlobalName: 'remoteCart',
                        shareScope: 'default'
                    },
                    // ADD THIS:
                    remoteReviews: {
                        type: 'module',
                        name: 'remoteReviews',
                        entry: 'http://localhost:3003/remoteEntry.js',
                        entryGlobalName: 'remoteReviews',
                        shareScope: 'default'
                    }
                },
                shared: {
                    vue: {
                        singleton: true,
                        requiredVersion: '^3.5.0'
                    }
                }
            })
        ]
    }
})
```

### Step 7: Add Navigation in Host

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

### Step 8: Create Reviews Page in Host

Create `apps/host/pages/reviews.vue`:

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const RemoteReviewsList = defineAsyncComponent(() =>
    // @ts-ignore - Module Federation remote
    import('remoteReviews/ReviewsList').catch((err) => {
        console.error('Failed to load remote Reviews module:', err)
        return { default: () => '<div>Failed to load Reviews module</div>' }
    })
)
</script>

<template>
    <div class="reviews-page">
        <h2>Product Reviews</h2>
        <p class="info">This component is loaded from the remote Reviews microfrontend</p>

        <Suspense>
            <template #default>
                <RemoteReviewsList />
            </template>
            <template #fallback>
                <div class="loading">
                    <p>Loading reviews...</p>
                </div>
            </template>
        </Suspense>
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

.loading::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f093fb;
    border-top-color: transparent;
    border-radius: 50%;
    margin-left: 10px;
    animation: spin 1s linear infinite;
    vertical-align: middle;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
```

### Step 9: Install Dependencies

From the root:

```bash
npm install
```

### Step 10: Test the New Microfrontend

Start all apps:

```bash
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
