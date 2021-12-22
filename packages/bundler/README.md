# @midwayjs/unplugin-hooks

Midway Hooks Plugin for Webpack & Vite

## Version Requirements

- Webpack 4+

## Usage

### Webpack Chain

```typescript
import { HooksWebpackPlugin } from '@midwayjs/unplugin-hooks';

function useWebpackChain(config) {
  config.plugin('@midwayjs/hooks').use(HooksWebpackPlugin());
  return config;
}
```
