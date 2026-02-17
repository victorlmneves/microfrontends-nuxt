import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack'
import { VueLoaderPlugin } from 'vue-loader'
import path from 'path'

const clientConfig = {
    mode: 'development',
    entry: './app.vue',
    target: 'web',
    output: {
        path: path.resolve(path.dirname(new URL(import.meta.url).pathname), 'dist'),
        filename: '[name].js',
        publicPath: 'http://localhost:3001/',
        clean: true
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
            name: 'remoteProducts',
            filename: 'remoteEntry.js',
            exposes: {
                './ProductList': './components/ProductList.vue'
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
        port: 3001,
        hot: true,
        allowedHosts: 'all',
        static: {
            directory: path.resolve(path.dirname(new URL(import.meta.url).pathname), 'dist')
        }
    }
}

const ssrConfig = {
    mode: clientConfig.mode,
    entry: clientConfig.entry,
    target: 'node',
    resolve: clientConfig.resolve,
    module: clientConfig.module,
    output: {
        path: path.resolve(path.dirname(new URL(import.meta.url).pathname), 'dist'),
        filename: '[name].ssr.js',
        publicPath: 'http://localhost:3001/',
        clean: false
    },
    plugins: [
        new VueLoaderPlugin(),
        new ModuleFederationPlugin({
            name: 'remoteProducts',
            filename: 'remoteEntry.ssr.js',
            exposes: {
                './ProductList': './components/ProductList.vue'
            },
            shared: {
                vue: { singleton: true, requiredVersion: false }
            },
            runtimePlugins: [],
            dts: false,
            runtime: false
        })
    ]
    // No devServer for SSR config
}

export default [clientConfig, ssrConfig]
