# @midwayjs/vite-plugin-hooks

## Usage

1. Install dependencies:

```bash
$ npm install @midwayjs/vite-plugin-hooks -D
```

2. Modify vite.config.ts or vite.config.js

```ts
import { defineConfig } from 'vite'
import hooks from '@midwayjs/vite-plugin-hooks'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [hooks()],
})
```

3. Referring to examples, add the following file

- midway.config.ts
- src/apis/lambda/index.ts
