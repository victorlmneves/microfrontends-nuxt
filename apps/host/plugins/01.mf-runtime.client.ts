import { getInstance, createInstance } from '@module-federation/runtime'

export default defineNuxtPlugin(() => {
    console.log('[MF Runtime] Initializing Federation instance...')

    // Create global Federation Runtime instance
    let instance = getInstance()

    if (!instance) {
        instance = createInstance({
            name: 'host',
            remotes: [
                {
                    name: 'remoteProducts',
                    entry: 'http://localhost:3001/remoteEntry.js'
                },
                {
                    name: 'remoteCart',
                    entry: 'http://localhost:3002/remoteEntry.js'
                }
            ]
        })

        console.log('[MF Runtime] ✅ Federation instance created')
    } else {
        console.log('[MF Runtime] ✅ Using existing instance')
    }
})
