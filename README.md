<p align="center">
  <img src="https://img.shields.io/npm/v/@midwayjs/hooks/latest?style=for-the-badge">
  <img src="https://img.shields.io/github/workflow/status/midwayjs/hooks/Node.js%20CI/master?style=for-the-badge">
  <img src="https://img.shields.io/codecov/c/github/midwayjs/hooks?style=for-the-badge">
  <img src="https://img.shields.io/npm/l/@midwayjs/hooks?style=for-the-badge">
</p>

`Midway Hooks` 是 Midway 云端一体场景的开发框架，致力于通过其特有的开发方式，让开发者专注于核心业务逻辑，提升应用研发效率。

官方文档：[Getting Started - 新云端一体解决方案](https://www.yuque.com/midwayjs/faas/quickstart_integration)

## ✨ 特性

- 🌈 提炼自阿里巴巴集团云端一体尝试的最佳实践。
- 📦 开箱即用，自动生成前端调用 SDK，再也不用手写任何 HTTP 请求了
- 🌍 React Hooks 风格的代码书写方式，提供前后端一致的应用研发体验。
- ⚙️ 深度兼容 Midway Serverless，提供 Serverless 场景下的全链路流程支持。
- 🛡 使用 TypeScript 开发，提供完整的类型定义文件。

## 本地开发

我们使用 yarn + lerna 来安装依赖

```bash
$ curl -o- -L yarnpkg.com/install.sh | bash
```

1. 初始化项目，安装依赖

```bash
$ yarn
```

2. 构建产物

```bash
$ yarn build
```

3. 开始开发

## 单元测试

```bash
$ yarn test
```
