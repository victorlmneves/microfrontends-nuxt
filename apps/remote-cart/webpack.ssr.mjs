import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack'
import { VueLoaderPlugin } from 'vue-loader'
import path from 'path'

export default {
    mode: 'development',
    entry: './app.vue',
    target: 'node',
    output: {
        path: path.resolve(path.dirname(new URL(import.meta.url).pathname), 'dist'),
        filename: '[name].ssr.js',
        publicPath: 'http://localhost:3002/',
        clean: false
    },
    resolve: {
        extensions: ['.js', '.ts', '.mjs', '.json', '.vue']
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.(ts|tsx)$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                },
                exclude: /node_modules/
            },
            {
                test: /\.m?js$/,
                type: 'javascript/auto'
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader']
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new ModuleFederationPlugin({
            name: 'remoteCart',
            filename: 'remoteEntry.ssr.js',
            exposes: {
                './ShoppingCart': './components/ShoppingCart.vue'
            },
            shared: {
                vue: { singleton: true, requiredVersion: false }
            },
            runtimePlugins: [],
            dts: false,
            runtime: false
        })
    ]
}
