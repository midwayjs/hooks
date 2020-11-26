<p align="center">
  <img src="./assets/midway-logo.png">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@midwayjs/hooks">
    <img src="https://img.shields.io/npm/v/@midwayjs/hooks/latest?style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@midwayjs/hooks">
    <img src="https://img.shields.io/npm/v/@midwayjs/hooks/canary?style=for-the-badge">
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
- 🌈&nbsp;&nbsp;The easiest way to develop and call back-end APIs
- 🌍&nbsp;&nbsp;Using "React Hooks" to develop the back-end
- 📦&nbsp;&nbsp;Front-end Framework agnostic. Current Support React / Vue3 / ICE.js
- ⚙️&nbsp;&nbsp;Built on [Midway](https://github.com/midwayjs/midway), providing full support for Web and Serverless scenarios
- 🛡&nbsp;&nbsp;TypeScript Ready

## Demo

### import server code into frontend code

> backend api

```typescript
export async function get() {
  return 'Hello Midway Hooks'
}

export async function post(name: string) {
  return 'Hello ' + name
}
```

> frontend

```typescript
import { get, post } from './apis/lambda'

/**
 * @method GET
 * @url /api/get
 */
get().then((message) => {
  // Display: Hello Midway Hooks
  console.log(message)
})

/**
 * @method POST
 * @url /api/post
 * @body { args: ['github'] }
 */
post('github').then((message) => {
  // Display: Hello github
  console.log(message)
})
```

### Hooks

> backend api

```typescript
import { useContext } from '@midwayjs/hooks'

export async function getPath() {
  const ctx = useContext()
  return ctx.path
}
```

> frontend

```typescript
import { getPath } from './apis/lambda'

/**
 * @method GET
 * @url /api/getPath
 */
getPath().then((path) => {
  // Display: /api/getPath
  console.log(path)
})
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
