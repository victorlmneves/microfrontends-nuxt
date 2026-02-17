import { defineNuxtConfig } from 'nuxt/config'
import { federation } from '@module-federation/vite'
import TopAwait from 'vite-plugin-top-level-await'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',

    devtools: { enabled: true },

    ssr: true,

    nitro: {
        static: true
    },

    routeRules: {
        '/remoteEntry.js': {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/javascript'
            }
        },
        '/_nuxt/**': {
            headers: { 'Access-Control-Allow-Origin': '*' }
        }
    },

    app: {
        baseURL: '/'
    },

    hooks: {
        'vite:extendConfig': (config, { isClient }) => {
            if (!isClient) {
                return
            }

            config.plugins = config.plugins || []
            config.plugins.unshift(
                federation({
                    name: 'remoteProducts',
                    filename: 'remoteEntry.js',
                    exposes: {
                        './ProductList': './components/ProductList.vue'
                    },
                    shared: {}
                }),
                TopAwait()
            )
        }
    },

    vite: {
        server: {
            origin: 'http://localhost:3001',
            cors: {
                origin: '*',
                methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
                credentials: true
            }
        },
        optimizeDeps: {
            esbuildOptions: {
                logLevel: 'silent'
            }
        },
        build: {
            target: 'esnext',
            minify: false,
            cssCodeSplit: false,
            modulePreload: false,
            rollupOptions: {
                output: {
                    format: 'es'
                }
            }
        },
        optimizeDeps: {
            include: ['vue']
        },
        resolve: {
            dedupe: ['vue']
        }
    }
})
