# @midwayjs/hooks

Midway Hooks Api

## 使用

```typescript
import { useContext } from '@midwayjs/hooks'

// get url query
export function getQuery() {
  const ctx = useContext()
  return ctx.query
}
```
