'use strict'
var  webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
var path = require('path')
let htmlLoader = require('./tools/html-loader/loader')

const ROOT_PATH = path.resolve(__dirname)
const SRC_PATH = path.resolve(ROOT_PATH, 'src')
const BUILD_PATH = path.resolve(ROOT_PATH, 'build')

module.exports = (() => {
    
    let config = {}
    
    config.resolve = {
        modulesDirectories: ['node_modules'],
        alias: {
            htmlReplaceFn: require.resolve('./tools/html-loader/replace.js')
        }
    }
    
    config.entry = {
        src: path.resolve(SRC_PATH, 'index.js'),
        vendor: ['babel-polyfill',
            'angular', 'angular-ui-router', 'angular-ui-bootstrap'
        ]
    }

    config.output = {
        filename: '[name].[hash].bundle.js',
        path: BUILD_PATH
    }

    config.module = {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'stage-3']
            },
            include: SRC_PATH
        }, {
            test: /\.html$/,
            loader: htmlLoader()
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract("style-loader", "css-loader?!postcss")
        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract("style-loader", "css?sourceMap&modules!postcss?parser=postcss-scss")
        }, {
            // ASSET LOADER
            // Reference: https://github.com/webpack/file-loader
            // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
            // Rename the file using the asset hash
            // Pass along the updated reference to your code
            // You can add here any file extension you want to get copied to your output
            test: /\.(ico|woff|woff2|ttf|eot)(\?.+)?$/,
            loader: 'file'
        }, {
            // ASSET LOADER
            // Reference: https://github.com/tcoopman/image-webpack-loader
            // Compress png, jpg, jpeg, gif, svg files to output
            // Rename the file using the asset hash
            // Pass along the updated reference to your code
            // You can add here any file extension you want to get copied to your output
            test: /\.(png|jpg|jpeg|gif|svg)(\?.+)?$/,
            loader: 'file'
        }]
    }

    config.plugins = [
        // 我们可以自己在build 文件夹里手动建一个 index.html 文件夹，然后再把合并以后的js引用在里面，但是这样有些麻烦，所以我们这里安装一个plugin，可以自动快速的帮我们生成HTML
        new HtmlWebpackPlugin({
            template: path.resolve(SRC_PATH, 'index.html'),
            // 要把 script 标签插入到哪里
            inject: 'body',
            filename: 'index.html',
            // chunks 这个参数告诉插件要引用 entry 里面的哪几个入口
            chunks: ['src', 'vendor']
        }),

        new ExtractTextPlugin("style.css"),

        // 使用 uglifyJs 压缩 js 代码
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            },
            minimize: true
        }),

        // 把入口文件里面的数组打包成 vendors.js
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')
    ]

    config.devtool = 'eval-source-map'

    config.devServer = {
        historyApiFallBack: true,
        hot: true,
        inline: true,
        progress: true
    }

    return config
})()
