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

<table>
<tr>
<th style="text-align: center;"> front-end invoke </th>
<th style="text-align: center;"> back-end api </th>
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

## 🚀 Quick Start

Please install `@midwayjs/cli` first.

```bash
$ npm i @midwayjs/cli -g
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
$ node bootstrap.js
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
