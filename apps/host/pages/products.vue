<script setup lang="ts">
import { ref, onMounted, markRaw, type Component } from 'vue'
import { loadRemoteComponentUniversal } from '../utils/loadRemoteUniversal'
import { loadRemoteStyles } from '../utils/loadRemoteCSS'

const RemoteProductList = ref<Component | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(true)

const loadRemoteComponent = async () => {
    try {
        // eslint-disable-next-line no-console
        console.log('[MF] Starting remote component load...')

        // Load remote CSS first
        await loadRemoteStyles('http://localhost:3001')

        // eslint-disable-next-line no-console
        console.log('[MF] CSS loading attempted')

        const remoteName = 'remoteProducts'
        const remoteEntry = 'http://localhost:3001/remoteEntry.js'

        const module = await loadRemoteComponentUniversal(remoteName, remoteEntry, 'ProductList')

        const component = (module as { default?: unknown }).default || module
        RemoteProductList.value = markRaw(component as object)
        isLoading.value = false

        // eslint-disable-next-line no-console
        console.log('[MF] ✅ Component ready')
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to load remote module'
        error.value = message
        isLoading.value = false

        console.error('[MF] ❌ Load failed:', message, e)
    }
}

const retry = () => {
    error.value = null
    isLoading.value = true
    loadRemoteComponent()
}

// Client-only loading
onMounted(() => {
    loadRemoteComponent()
})
</script>

<template>
    <div class="products-page">
        <h2>Products Catalog</h2>
        <p class="info">This component is loaded from the remote Products microfrontend</p>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading">
            <p>Loading products...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error">
            <p>Failed to load products: {{ error }}</p>
            <button @click="retry">Retry</button>
        </div>

        <!-- Success State -->
        <component :is="RemoteProductList" v-else-if="RemoteProductList" />
    </div>
</template>

<style scoped>
.products-page h2 {
    color: #333;
    margin-bottom: 1rem;
}

.info {
    background: #e3f2fd;
    padding: 1rem;
    border-radius: 4px;
    border-left: 4px solid #2196f3;
    margin-bottom: 2rem;
    color: #0d47a1;
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
    border: 3px solid #667eea;
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
