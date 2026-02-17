/* eslint-disable no-console */

interface IMFHookArgs {
    [key: string]: unknown
}

const runtimePlugin = () => {
    return {
        name: 'microfrontends-mf-plugin',
        beforeInit(args: IMFHookArgs) {
            console.log('[MF] [HOOK] beforeInit', args)

            return args
        },
        init(args: IMFHookArgs) {
            console.log('[MF] [HOOK] init', args)

            return args
        },
        beforeRequest(args: IMFHookArgs) {
            console.log('[MF] [HOOK] beforeRequest', args.id)

            return args
        },
        afterResolve(args: IMFHookArgs) {
            console.log('[MF] [HOOK] afterResolve', args)

            return args
        },
        onLoad(args: IMFHookArgs) {
            console.log('[MF] [HOOK] onLoad', args)

            return args
        }
    }
}

export default runtimePlugin
