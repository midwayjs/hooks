<p align="center">
  <img src="./assets/midway-logo.png">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@midwayjs/hooks">
    <img src="https://img.shields.io/npm/v/@midwayjs/hooks/latest?style=for-the-badge">
  </a>
  <img src="https://img.shields.io/github/workflow/status/midwayjs/hooks/Node.js%20CI/master?style=for-the-badge">
  <a href="https://codecov.io/gh/midwayjs/hooks">
    <img src="https://img.shields.io/codecov/c/github/midwayjs/hooks?style=for-the-badge">
  </a>
  <img src="https://img.shields.io/npm/l/@midwayjs/hooks?style=for-the-badge">
</p>

# 更快的全栈框架

Docs：[Getting Started - 新云端一体解决方案](https://www.yuque.com/midwayjs/faas/quickstart_integration)

## ✨ 特性

- ☁️&nbsp;&nbsp;全栈，在 src 一个目录中开发前后端代码
- 🌈&nbsp;&nbsp;"零" API，从后端 import 函数，调用时自动转换为 API 请求
- 🌍 使用 "React Hooks | Vue composition" 开发后端
- 📦 跨前端框架. 支持 React / Vue3 / ICE.js
- ⚙️ 基于 [Midway](https://github.com/midwayjs/midway), 提供 Web 及 Serverless 场景下的完整支持.
- 🛡 完善的 TypeScript 支持

## 🌰 Demo

### 后端 API 与前端调用

> backend api
> src/apis/lambda/index.ts

```typescript
export async function get() {
  return 'Hello Midway Hooks'
}

export async function post(name: string) {
  return 'Hello ' + name
}
```

> frontend
> src/page/index.tsx

```typescript
import { get, post } from './apis/lambda'

get().then((message) => {
  // 发送 GET 请求到 /api/get
  // 返回值： Hello Midway Hooks
  console.log(message)
})

post('github').then((message) => {
  // 发送 Post 请求到 /api/post, HTTP Body is { args: ['github'] }
  // 返回值： Hello github
  console.log(message)
})
```

### 使用 Hooks

> backend api
> src/apis/lambda/index.ts

```typescript
import { useContext } from '@midwayjs/hooks'

export async function getPath() {
  // 获取请求 HTTP Context
  const ctx = useContext()
  return ctx.path
}
```

> frontend
> src/page/index.tsx

```typescript
import { getPath } from './apis/lambda'

getPath().then((path) => {
  // 发送 GET 请求到 /api/getPath
  // 返回值: /api/getPath
  console.log(path)
})
```

## 🚀 快速开始

请先安装 faas-cli.

```bash
npm i @midwayjs/faas-cli -g
```

### 创建

React

```bash
f create --template-package=@midwayjs-examples/midway-hooks-react
```

Vue:

```bash
$ f create --template-package=@midwayjs-examples/midway-hooks-vue3
```

ICE.js:

```bash
$ npm init ice ice-app --template @icedesign/scaffold-midway-faas
```

### 运行

```bash
npm start
```

### 部署

```bash
f deploy
```

## Contribute

我们使用 yarn + lerna 管理项目

> install dependencies

```bash
$ yarn
```

> build

```bash
$ yarn build
```

> watch

```bash
$ yarn watch
```

> test

```bash
$ yarn test
```
