# @midwayjs/dev-pack

Express

```js
import { createExpressDevPack } from '@midwayjs/dev-pack';
import express from 'express';

const { middleware } = await createExpressDevPack({
  cwd: process.cwd(),
  sourceDir: resolve(process.cwd(), 'src'),
  watch: true,
});

const app = express();
app.use(middleware);
app.listen(3000);
```
