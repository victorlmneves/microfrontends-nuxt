// Client-only federation loader for Nuxt 3
// Uses @module-federation/runtime (browser only)

export async function loadRemoteComponentUniversal(
    remoteName: string,
    remoteEntry: string,
    exposedModule: string
): Promise<Record<string, unknown>> {
    if (typeof window === 'undefined') {
        throw new Error('This loader is client-only. Use onMounted() to call it.')
    }

    const runtime = await import('@module-federation/runtime')
    const getInstance = runtime.getInstance
    const createInstance = runtime.createInstance
    let instance = getInstance()

    if (instance) {
        instance.registerRemotes([{ name: remoteName, entry: remoteEntry }])
    } else {
        instance = createInstance({
            name: 'host',
            remotes: [{ name: remoteName, entry: remoteEntry }]
        })
    }

    const module = (await instance.loadRemote(`${remoteName}/${exposedModule.replace(/^\./, '')}`)) as Record<string, unknown>

    return (module.default || module) as Record<string, unknown>
}
