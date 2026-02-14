export default defineNuxtPlugin(() => {
    // Plugin placeholder to ensure Module Federation runtime is loaded
    if (process.client) {
        console.log('[remoteCart] Module Federation Runtime loaded')
    }
})
