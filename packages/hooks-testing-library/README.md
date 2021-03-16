# @midwayjs/hooks-testing-library

## Usage

```ts
import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library'
import api, { get, post } from './api.ts'

describe('test new features', () => {
  let app: HooksApplication
  beforeAll(async () => {
    app = await createApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('runFunction', async () => {
    expect(await app.runFunction(api)).toMatchInlineSnapshot()
    expect(await app.runFunction(post, 'Jake')).toMatchInlineSnapshot()
  })

  it('request', async () => {
    const response = await app.request(get).expect(200)
    expect(response.body).toMatchInlineSnapshot()
  })
})
```
