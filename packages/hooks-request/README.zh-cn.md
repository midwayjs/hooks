# @midwayjs/hooks-request

Midway Hooks 前端请求 SDK

## 使用

```typescript
import { request } from '@midwayjs/hooks/request'

function fetch(...args) {
  return request({
    url: '/api',
    method: 'GET',
    data: {
      args: args,
    },
    meta: {
      functionName: 'lambda-index',
      gateway: 'http',
      functionGroup: 'midway-faas-react-demo',
    },
  })
}

const response = await fetch()
console.log(response)
```
