<img src="https://img.alicdn.com/imgextra/i1/O1CN01xQLU011T2R7PHksIv_!!6000000002324-2-tps-1200-616.png" width="1000" alt="Midway Logo" />

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

# 全栈框架：更快 & 更具生产力

Docs：[Getting Started - 新云端一体解决方案](https://midwayjs.org/docs/hooks_intro)

## ✨ 特性

- ☁️&nbsp;&nbsp;全栈，在 src 一个目录中开发前后端代码
- 🌈&nbsp;&nbsp;"零" API，从后端 import 函数，调用时自动转换为 API 请求
- 🌍 使用 "React Hooks | Vue composition Api" 开发后端
- ⚡️&nbsp;&nbsp;极快的启动速度（小于 3 秒）
- ⚙️&nbsp;&nbsp;使用 Vite，支持 React/Vue 等框架
- ✈️&nbsp;&nbsp;可部署至 Server 或者 Serverless
- 🛡 完善的 TypeScript 支持

## 🌰 Demo

<table>
<tr>
<th style="text-align: center;"> 前端调用 </th>
<th style="text-align: center;"> 后端 API </th>
</tr>
<tr>
<td>
<sub>

<!-- prettier-ignore -->
```ts
import { getPath, post } from './apis/lambda';

// send GET request to /api/getPath
const path = await getPath();
console.assert(path === '/api/getPath');

const { message, method } = await post('Jake');

console.assert(message === 'Hello Jake!');
console.assert(method === 'POST');






```

</sub>
</td>
<td>

<sub>

```ts
import { useContext } from '@midwayjs/hooks';

export async function getPath() {
  // Get HTTP request context by Hooks
  const ctx = useContext();
  return ctx.path;
}

export async function post(name: string) {
  const ctx = useContext();

  return {
    message: `Hello ${name}!`,
    method: ctx.method,
  };
}
```

</sub>
</td>
</tr>
</table>

## 🚀 快速开始

请先安装 @midwayjs/cli

```bash
npm i @midwayjs/cli -g
```

### 创建

```bash
mw new my-app
```

### 运行

```bash
npm run dev
```

### 部署至服务器

```bash
node bootstrap.js
```

### 部署至 Serverless

```bash
npm run deploy
```

## Contribute

1. Fork 仓库!
2. 创建分支: `git checkout -b my-new-feature`
3. 提交改动: `git commit -am 'Add some feature'`
4. 推送到刚才创建的分支: `git push origin my-new-feature`
5. 提交 Pull Request :D

我们使用 yarn + lerna 管理项目

- install dependencies

```bash
yarn
```

- build

```bash
yarn build
```

- watch

```bash
yarn watch
```

- test

```bash
yarn test
```

## 开源协议

Midway Serverless based [MIT licensed](./LICENSE).

## 关于我们

[Alibaba Open Source](https://opensource.alibaba.com/)
