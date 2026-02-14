export default defineNuxtPlugin(() => {
    // Plugin placeholder to ensure Module Federation runtime is loaded
    if (process.client) {
        console.log('[remoteProducts] Module Federation Runtime loaded')
    }
})
