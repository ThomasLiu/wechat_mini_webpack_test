const { resolve } = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const LodashWebpackPlugin = require("lodash-webpack-plugin");
const MinaWebpackPlugin = require("./plugin/MinaWebpackPlugin");
const MinaRuntimePlugin = require("./plugin/MinaRuntimePlugin");

const debuggable = process.env.BUILD_TYPE !== "release";

console.log(`环境：${process.env.NODE_ENV}`);
console.log(`构建类型：${process.env.BUILD_TYPE}`);

module.exports = {
  context: resolve("src"),
  entry: "./app.js",
  output: {
    path: resolve("dist"),
    filename: "[name].js",
    globalObject: "wx",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV) || "development",
      BUILD_TYPE: JSON.stringify(process.env.BUILD_TYPE) || "debug",
    }),
    new MinaWebpackPlugin(),
    new MinaRuntimePlugin(),
    new LodashWebpackPlugin(),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new CopyWebpackPlugin([
      {
        from: "**/*",
        to: "./",
        ignore: ["**/*.js"],
      },
    ]),
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
      name: "common",
      minChunks: 2,
      minSize: 0,
    },
    runtimeChunk: {
      name: "runtime",
    },
  },
  mode: debuggable ? "none" : "production",
};
