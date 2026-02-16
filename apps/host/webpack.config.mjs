import webpackPkg from 'webpack'
const { container: _container } = webpackPkg
const { ModuleFederationPlugin } = _container
import { VueLoaderPlugin } from 'vue-loader'
import path from 'path'

export default {
    mode: 'development',
    entry: './app.vue',
    target: 'web',
    output: {
        path: path.resolve(path.dirname(new URL(import.meta.url).pathname), 'dist'),
        filename: '[name].js',
        library: { type: 'umd', name: 'host' },
        publicPath: 'auto',
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
            name: 'host',
            remotes: {
                remoteProducts: 'remoteProducts@http://localhost:3001/remoteEntry.js',
                remoteCart: 'remoteCart@http://localhost:3002/remoteEntry.js'
            },
            shared: {
                vue: { singleton: true, requiredVersion: false }
            }
        })
    ],
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        port: 3000,
        hot: true,
        allowedHosts: 'all',
        static: {
            directory: path.resolve(path.dirname(new URL(import.meta.url).pathname), 'dist')
        }
    }
}
