// plugin/MinaWebpackPlugin.js
const SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin");
const MultiEntryPlugin = require("webpack/lib/MultiEntryPlugin");
const path = require("path");
const fs = require("fs");
const replaceExt = require("replace-ext");

function itemToPlugin(context, item, name) {
  if (Array.isArray(item)) {
    return new MultiEntryPlugin(context, item, name);
  }
  return new SingleEntryPlugin(context, item, name);
}

function _inflateEntries(entries = [], dirname, entry) {
  const configFile = replaceExt(entry, ".json");
  const content = fs.readFileSync(configFile, "utf8");
  const config = JSON.parse(content);

  ["pages", "usingComponents"].forEach((key) => {
    const items = config[key];
    if (typeof items === "object") {
      Object.values(items).forEach((item) =>
        inflateEntries(entries, dirname, item)
      );
    }
  });
}

function inflateEntries(entries, dirname, entry) {
  entry = path.resolve(dirname, entry);
  if (entry != null && !entries.includes(entry)) {
    entries.push(entry);
    _inflateEntries(entries, path.dirname(entry), entry);
  }
}

class MinaWebpackPlugin {
  constructor() {
    this.entries = [];
  }

  applyEntry(compiler, done) {
    const { context } = compiler.options;
    this.entries
      // 将文件的扩展名替换成 js
      .map((item) => replaceExt(item, ".js"))
      // 把绝对路径转换成相对于 context 的路径
      .map((item) => path.relative(context, item))
      // 应用每一个入口文件，就像手动配置的那样
      // 'app'              : './app.js',
      // 'pages/index/index': './pages/index/index.js',
      // 'pages/logs/logs'  : './pages/logs/logs.js',
      .forEach((item) =>
        itemToPlugin(context, "./" + item, replaceExt(item, "")).apply(compiler)
      );
    if (done) {
      done();
    }
  }
  // apply 是每一个插件的入口
  apply(compiler) {
    const { context, entry } = compiler.options;
    inflateEntries(this.entries, context, entry);

    compiler.hooks.entryOption.tap("MinaWebpackPlugin", () => {
      this.applyEntry(compiler);
      // 返回 true 告诉 webpack 内置插件就不要处理入口文件了，因为这里已经处理了
      return true;
    });

    // 监听 watchRun 事件
    compiler.hooks.watchRun.tap("MinaWebpackPlugin", (compiler, done) => {
      this.applyEntry(compiler, done);
    });
  }
}

module.exports = MinaWebpackPlugin;
