import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack'
import { VueLoaderPlugin } from 'vue-loader'
import path from 'path'

export default {
    mode: 'development',
    entry: './app.vue',
    target: 'web',
    output: {
        path: path.resolve(path.dirname(new URL(import.meta.url).pathname), 'dist'),
        filename: '[name].js',
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
            filename: 'remoteEntry.js',
            exposes: {
                './ShoppingCart': './components/ShoppingCart.vue'
            },
            shared: {
                vue: { singleton: true, requiredVersion: false }
            },
            runtimePlugins: [],
            dts: false
        })
    ],
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        port: 3002,
        hot: true,
        allowedHosts: 'all',
        static: {
            directory: path.resolve(path.dirname(new URL(import.meta.url).pathname), 'dist')
        }
    }
}
