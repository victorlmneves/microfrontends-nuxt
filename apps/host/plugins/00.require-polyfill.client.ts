interface RequireFunction {
    (id: string): Record<string, unknown>
    ensure: () => Promise<void>
    resolve: (id: string) => string
}

declare global {
    interface Window {
        require: RequireFunction
        process: { env: { NODE_ENV: string } }
    }
}

export default defineNuxtPlugin({
    name: 'require-polyfill',
    enforce: 'pre', // Execute before everything
    setup() {
        if (typeof window !== 'undefined') {
            // Require polyfill for Module Federation
            window.require = function (id: string) {
                console.warn(`[Polyfill] require('${id}') called - returning empty object`)
                return {}
            }

            // Add require methods
            window.require.ensure = function () {
                return Promise.resolve()
            }

            window.require.resolve = function (id: string) {
                return id
            }

            // Define as browser environment
            if (typeof process === 'undefined') {
                window.process = { env: { NODE_ENV: 'production' } }
            }

            console.log('✅ Require polyfill installed')
        }
    }
})
