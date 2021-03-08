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

# A Faster Full Stack Framework

> [中文 README](./README.zh-cn.md)

Docs：[Getting Started](https://www.yuque.com/midwayjs/faas/quickstart_integration?translate=en)

## ✨ Features

- ☁️&nbsp;&nbsp;Fullstack, the src directory contains front-end and back-end code
- 🌈&nbsp;&nbsp;"Zero" Api, import server functions directly into frontend and automatically create API requests.
- 🌍&nbsp;&nbsp;Using "React Hooks | Vue composition" to develop the back-end
- 📦&nbsp;&nbsp;Front-end Framework agnostic. Current support React / Vue3 / ICE.js
- ⚙️&nbsp;&nbsp;Built on [Midway](https://github.com/midwayjs/midway), providing full support for Web and Serverless scenarios
- 🛡&nbsp;&nbsp;TypeScript Ready

## 🌰 Demo

### backend api & frontend invoke

> backend api
> src/apis/lambda/index.ts

```typescript
import { useContext } from '@midwayjs/hooks'

export async function getPath() {
  // Get HTTP request context by Hooks
  const ctx = useContext()
  return ctx.path
}
```

> frontend
> src/page/index.tsx

```typescript
import { getPath } from './apis/lambda'

getPath().then((path) => {
  // send GET request to /api/getPath
  // Result: /api/getPath
  console.log(path)
})
```

## 🚀 Quick Start

Please install faas-cli first.

```bash
$ npm i @midwayjs/faas-cli -g
```

### Create

```bash
mw new my-app
```

### Run

```bash
$ npm run dev
```

### Deploy to custom server

```bash
$ node boot.js
```

### Deploy to Serverless

```bash
$ npm run deploy
```

## Contribute

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

We use yarn + lerna to manage the project.

- install dependencies

```bash
$ yarn
```

- build

```bash
$ yarn build
```

- watch

```bash
$ yarn watch
```

- test

```bash
$ yarn test
```

## license

Midway Serverless based [MIT licensed](./LICENSE).

## About

[Alibaba Open Source](https://opensource.alibaba.com/)
