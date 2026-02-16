const { ModuleFederationPlugin } = require('webpack').container
const { VueLoaderPlugin } = require('vue-loader')
const path = require('path')

module.exports = {
    mode: 'development',
    entry: './app.vue',
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: { type: 'umd', name: 'remoteCart' },
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
            name: 'remoteCart',
            filename: 'remoteEntry.js',
            exposes: {
                './ShoppingCart': './components/ShoppingCart.vue'
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
        port: 3002,
        hot: true,
        allowedHosts: 'all',
        static: {
            directory: path.resolve(__dirname, 'dist')
        }
    }
}
