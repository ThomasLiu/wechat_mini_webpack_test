const { resolve } = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MinaWebpackPlugin = require("./plugin/MinaWebpackPlugin");
const MinaRuntimePlugin = require("./plugin/MinaRuntimePlugin");

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
    new MinaWebpackPlugin(),
    new MinaRuntimePlugin(),
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
    runtimeChunk: {
      name: "runtime",
    },
  },
  mode: "none",
};
