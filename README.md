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

# Full Stack Framework: Faster & More Productive

> [中文 README](./README.zh-cn.md)

Docs：[Getting Started](https://www.yuque.com/midwayjs/midway_v2/integration_introduction?translate=en)

## ✨ Features

- ☁️&nbsp;&nbsp;Fullstack, the src directory contains front-end and back-end code
- 🌈&nbsp;&nbsp;"Zero" Api, import server functions directly into frontend and automatically create API requests.
- 🌍&nbsp;&nbsp;Using "React Hooks | Vue composition Api" to develop the back-end
- ⚡️&nbsp;&nbsp;Extremely fast start-up speed, less than 3S
- ⚙️&nbsp;&nbsp;Using Vite, supports Vue/React (any other framework supported by Vite)
- ✈️&nbsp;&nbsp;Deploy to Server or Serverless
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
