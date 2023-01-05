---
title: 全栈套件
---

在 Midway Hooks 中，我们提供了 `@midwayjs/hooks-kit` 来快速开发全栈应用。目前我们提供了以下可直接使用的模版：

- [react](https://github.com/midwayjs/hooks/blob/main/examples/react)
- [vue](https://github.com/midwayjs/hooks/blob/main/examples/vue)
- [prisma](https://github.com/midwayjs/hooks/blob/main/examples/prisma)

## 命令行界面

在使用了 `@midwayjs/hooks-kit` 的项目中，可以在 npm scripts 中使用 hooks 可执行文件，或者通过 `npx hooks` 运行。下面是通过脚手架创建的 Midway 全栈项目中默认的 npm scripts：

```json
{
  "scripts": {
    "dev": "hooks dev", // 启动开发服务器
    "start": "hooks start", // 启动生产服务器，使用前请确保已运行 `npm run build`
    "build": "hooks build" // 为生产环境构建产物
  }
}
```

在使用命令行时，可以通过命令行参数传入选项，具体选项可以通过 --help 参考。

如：`hooks build --help`

输出：

```
Usage:
  $ hooks build [root]

Options:
  --outDir <dir>  [string] output directory (default: dist)
  --clean         [boolean] clean output directory before build (default: false)
  -h, --help      Display this message
```

## 自定义构建产物目录

自定义构建目录可以通过以下两种方式。

### 设置 midway.config.[ts|js]

以 `Vue 一体化项目` 为例，`build.outDir` 为构建产物的输出目录。

```js
import vue from '@vitejs/plugin-vue';
import { defineConfig } from '@midwayjs/hooks-kit';

export default defineConfig({
  vite: {
    plugins: [vue()],
  },
  build: {
    outDir: 'build',
  },
});
```

### 设置命令行参数

在使用 `hooks build` 时，可以设置 `--outDir` 参数设置构建产物的输出目录。

例子：

```
hooks build --outDir build
```

## 启动时指定构建产物目录

通过 `hooks start [root]` 可以指定启动时的目录。

例子：

```
hooks start ./build
```

## 升级至 Vite 4

在 `@midwayjs/hooks-kit` 3.0 版本中，我们使用 Vite 2。在 3.1.0 版本中，我们升级至 Vite 4。如果你的项目使用了 Vite 2 的配置，可以通过以下方式升级。

### React

升级项目依赖 `"@vitejs/plugin-react` 至 3.0.0 版本。

### Vue

升级项目依赖 `"@vitejs/plugin-vue` 至 4.0.0 版本。

### 使用 pnpm

在项目中增加 `@midwayjs/serve` 依赖。

```json
{
  "dependencies": {
    "@midwayjs/serve": "^3.1.0"
  }
}
```
