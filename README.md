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
  // send GET request to /api/get
  // Result: Hello Midway Hooks
  console.log(message)
})

post('github').then((message) => {
  // send Post request to /api/post, HTTP Body is { args: ['github'] }
  // Result: Hello github
  console.log(message)
})
```

### Using Hooks

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
npm i @midwayjs/faas-cli -g
```

### Create

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

### Run

```bash
npm start
```

### Deploy

```bash
f deploy
```

## Contribute

We use yarn + lerna to manage the project.

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
