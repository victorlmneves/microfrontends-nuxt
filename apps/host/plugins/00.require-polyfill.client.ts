export default defineNuxtPlugin({
    name: 'require-polyfill',
    enforce: 'pre', // Execute before everything
    setup() {
        if (typeof window !== 'undefined') {
            // Require polyfill for Module Federation
            ;(window as any).require = function (id: string) {
                console.warn(`[Polyfill] require('${id}') called - returning empty object`)
                return {}
            }

            // Add require methods
            ;(window as any).require.ensure = function () {
                return Promise.resolve()
            }

            ;(window as any).require.resolve = function (id: string) {
                return id
            }

            // Define as browser environment
            if (typeof process === 'undefined') {
                ;(window as any).process = { env: { NODE_ENV: 'production' } }
            }

            console.log('✅ Require polyfill installed')
        }
    }
})
