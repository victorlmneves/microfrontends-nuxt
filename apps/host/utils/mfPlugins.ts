const runtimePlugin = () => {
    return {
        name: 'microfrontends-mf-plugin',
        beforeInit(args) {
            console.log('[MF] [HOOK] beforeInit', args);
            return args;
        },
        init(args) {
            console.log('[MF] [HOOK] init', args);
            return args;
        },
        beforeRequest(args) {
            console.log('[MF] [HOOK] beforeRequest', args.id);
            return args;
        },
        afterResolve(args) {
            console.log('[MF] [HOOK] afterResolve', args);
            return args;
        },
        onLoad(args) {
            console.log('[MF] [HOOK] onLoad', args);
            return args;
        },
    };
};

export default runtimePlugin;
