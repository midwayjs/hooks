# @midwayjs/next-hooks-compiler

Midway Hooks compiler

## Demo

### Compile built-in hooks

> source

```typescript
import { useContext } from '@midwayjs/hooks'

export function useQuery(id: string) {
  const { query } = useContext()
  return query[id] || ''
}
```

> output

```typescript
export function useQuery(id: string) {
  const _req_ctx = this
  const { query } = _req_ctx.ctx.hooks.useContext()
  return query[id] || ''
}
```

### Compile reference

> source

```typescript
import { useContext } from '@ali/midway-hooks'

export function useQuery(id: string) {
  const { query } = useContext()
  return query[id] || ''
}

export function useResponse() {
  const name = useQuery('hello')
  return name
}
```

> output

```typescript
export function useQuery(id: string) {
  const _req_ctx = this
  const { query } = _req_ctx.ctx.hooks.useContext()
  return query[id] || ''
}

export function useResponse() {
  const _req_ctx = this
  const name = useQuery.bind(_req_ctx)('hello')
  return name
}
```
