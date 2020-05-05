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
      {
        test: /\.(scss)$/,
        include: /src/,
        use: [
          {
            loader: "file-loader",
            options: {
              useRelativePath: true,
              name: "[path][name].wxss",
              context: resolve("src"),
            },
          },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                includePaths: [resolve("src", "styles"), resolve("src")],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV) || "development",
      BUILD_TYPE: JSON.stringify(process.env.BUILD_TYPE) || "debug",
    }),
    new MinaWebpackPlugin({
      scriptExtensions: [".js"],
      assetExtensions: [".scss"],
    }),
    new CopyWebpackPlugin([
      {
        from: "**/*",
        to: "./",
        ignore: ["**/*.js", "**/*.scss"],
      },
    ]),
    new MinaRuntimePlugin(),
    new LodashWebpackPlugin(),
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
  devtool: debuggable ? "inline-source-map" : "source-map",
};
