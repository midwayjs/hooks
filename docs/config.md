---
title: 项目配置
---

我们通过项目根目录下的 `midway.config.ts` 来配置项目，具体的配置项如下。

> 如果是纯接口项目，因为需要在生成环境读取配置，因此请使用 JavaScript，配置文件名： `midway.config.js`

## source: string

配置后端根目录，纯服务接口下默认为 `./src`，全栈应用下默认为 `./src/api`。

## routes: RouteConfig[]

启用文件系统路由并配置，默认为 `undefined`。具体格式参考 [简易模式 & 文件系统路由](./file-route)。

## static: ServeOptions | boolean

构建产物的静态托管配置，默认为 `true`，表示使用内置的 `@midwayjs/serve` 组件托管静态文件。设置为 `false` 时，需要自行托管构建产物。
如果像使用内置的组件托管，并配置更多的托管参数，可以传入 `ServeOptions` 对象， 其值可以参考 [midway 文档](https://midwayjs.org/docs/extensions/static_file#%E5%8F%AF%E7%94%A8%E9%85%8D%E7%BD%AE)。

## dev.include: string[]

配置全栈应用下，如果请求的 URL 中包含 `dev.include` 的关键词，则请求将由后端 Server 处理。

## dev.exclude: string[]

配置全栈应用下，如果请求的 URL 中包含 `dev.exclude` 的关键词，则请求将由前端的 Dev Server 处理。

## dev.ignorePattern: IgnorePattern

配置全栈应用下，本地开发的哪些请求应该忽略，不进入服务端处理。当传入自定义 `ignorePattern`，`dev.include` & `dev.exclude` 无效。

```ts
function ignorePattern(req) {
  if (req.url.includes('api')) {
    return false; // 后端服务处理
  }
  return true; // 前端 Dev Server 处理
}
```

## build.outDir: string

配置全栈应用的输出目录，默认为 `./dist`。

## vite: ViteConfig

仅 `import { defineConfig } from '@midwayjs/hooks-kit'` 时可用。

配置全栈应用下 Vite 的配置，具体配置项参考 [Vite](https://vitejs.dev/config/)。

例子：

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from '@midwayjs/hooks-kit';

export default defineConfig({
  vite: {
    plugins: [react()],
  },
});
```
