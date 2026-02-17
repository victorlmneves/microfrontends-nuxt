import { defineNuxtConfig } from 'nuxt/config'

// WIP: Minimal Nuxt config - remote runs with webpack.client.mjs
// Future SSR: This config will be enhanced for Nuxt+MF SSR integration
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',

    devtools: { enabled: true },

    builder: 'webpack',

    ssr: true,

    app: {
        baseURL: '/'
    }
})
