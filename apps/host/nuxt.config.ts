import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',

    devtools: { enabled: true },

    builder: 'webpack',

    ssr: true,

    // WIP: Webpack externals for SSR - kept for future server-side Module Federation
    webpack: {
        externals: {
            '@module-federation/node': 'commonjs @module-federation/node'
        }
    },

    vite: {
        server: {
            fs: {
                allow: ['.']
            },
            cors: true
        },
        optimizeDeps: {
            exclude: ['@module-federation/runtime']
        }
    }
})
