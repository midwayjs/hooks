# Web 中间件

Midway Hooks 支持三种形式的中间件。

- 全局，对所有 Api 调用都生效
- 文件，对文件内部所有 Api 生效
- 函数，仅对该 Api 函数生效

## 代码示例

相关代码示例可以参考提供的 [Middleware Example](../examples/middleware/readme.md)

## 使用中间件

### 全局中间件

全局中间件在 `configuration.ts` 中定义，可以传入任何框架支持的中间件

```ts
import { hooks, createConfiguration } from '@midwayjs/hooks';
import bodyParser from 'koa-bodyparser';

// Global Middleware
export default createConfiguration({
  imports: [
    hooks({
      middleware: [bodyParser()],
    }),
  ],
});
```

### 文件中间件

文件中间件在 Api 文件中定义，通过导出 `config.middleware`，使得其对该文件内所有 Api 函数生效。

```ts
import { ApiConfig } from '@midwayjs/hooks';
import bodyParser from 'koa-bodyparser';

// File Level Middleware
export const config: ApiConfig = {
  middleware: [bodyParser()],
};

export default (name: string) => {
  return 'Hello ' + name;
};
```

### 函数中间件

通过提供的 `withController` 方法，我们可以定义一个仅对单个函数生效的中间件。

```ts
import { withController } from '@midwayjs/hooks';
import bodyParser from 'koa-bodyparser';

// Function Level Middleware
export default withController({ middleware: [bodyParser()] }, async () => {
  return {
    message: 'Hello World',
    framework: '@midwayjs/hooks',
  };
});
```

## 开发中间件

在 Midway Hooks 中，中间件的开发模式与 Web 框架一致，以 Koa 为例。

```ts
import { Context, IMidwayKoaNext } from '@midwayjs/koa';
import { useContext } from '@midwayjs/hooks';

const logger = async (next: IMidwayKoaNext) => {
  const ctx = useContext<Context>();

  console.log(`[${level}] <-- [${ctx.method}] ${ctx.url}`);
  const start = Date.now();

  await next();

  const cost = Date.now() - start;
  console.log(`[${level}] --> [${ctx.method}] ${ctx.url} ${cost}ms`);
  ctx.set(level, `${cost}ms`);
};
```
