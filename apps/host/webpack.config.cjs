const { ModuleFederationPlugin } = require('webpack').container
const path = require('path')

module.exports = {
    mode: 'development',
    entry: './.output/server/index.mjs',
    target: 'node',
    output: {
        path: path.resolve(__dirname, '.output/webpack'),
        filename: 'server.js',
        library: { type: 'commonjs2' },
        publicPath: 'auto',
        clean: true
    },
    resolve: {
        extensions: ['.js', '.ts', '.mjs', '.json']
    },
    plugins: [
        new ModuleFederationPlugin({
            name: 'host',
            remotes: {
                remoteProducts: 'remoteProducts@http://localhost:3001/remoteEntry.js'
                // Add other remotes as needed
            },
            shared: {
                vue: { singleton: true, requiredVersion: false }
            }
        })
    ],
    externals: [
        // Exclude node_modules from bundle
        /^[a-z0-9@][\w@/.-]*$/i
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                type: 'javascript/auto'
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    }
}
