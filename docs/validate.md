---
title: 参数校验
---

## 校验

Midway Hooks 内置了 [zod](https://www.npmjs.com/package/zod) 校验器，并提供 `Validate(...schemas: any[])` 函数来校验入参。

其中 `Validate` 传入的 Schema 顺序与用户入参顺序匹配。

### 基础示例

```ts
import {
  Api,
  Post,
  Validate,
} from '@midwayjs/hooks';
import { z } from 'zod';

export default Api(
  Post('/hello'),
  Validate(z.string(), z.number()),
  async (name: string, age: number) => {
    return `Hello ${name}, you are ${age} years old.`;
  }
);
```

一体化调用：

```ts
import hello from './api';

try {
  await hello(null, null);
} catch (error) {
  console.log(error.message); // 'name must be a string'
  console.log(error.status); // 422
}
```

手动调用：

```ts
fetcher
  .post('/hello', {
    args: [null, null],
  })
  .catch((error) => {
    console.log(error.message); // 'name must be a string'
    console.log(error.status); // 422
  });
```

### TypeScript 支持

你可以通过 zod 内置的 TypeScript 功能，来实现复杂类型的推导与校验。

示例如下：

```ts
import {
  Api,
  Post,
  Validate,
} from '@midwayjs/hooks';
import { z } from 'zod';

const Project = z.object({
  name: z.string(),
  description: z.string(),
  owner: z.string(),
  members: z.array(z.string()),
});

export default Api(
  Post('/project'),
  Validate(Project),
  async (
    // { name: string, description: string, owner: string, members: string[] }
    project: z.infer<typeof Project>
  ) => {
    return project;
  }
);
```

一体化调用：

```ts
import createProject from './api';

try {
  await createProject({
    name: 1,
    description: 'test project',
    owner: 'test',
    members: ['test'],
  });
} catch (error) {
  console.log(error.message); // 'name must be a string'
  console.log(error.status); // 422
}
```

手动调用：

```ts
fetcher
  .post('/project', {
    args: [
      {
        name: 1,
        description: 'test project',
        owner: 'test',
        members: ['test'],
      },
    ],
  })
  .catch((error) => {
    console.log(error.message); // 'name must be a string'
    console.log(error.status); // 422
  });
```
