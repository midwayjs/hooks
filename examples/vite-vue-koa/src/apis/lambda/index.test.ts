import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library'
import api, { get, post } from '.'
import { join } from 'path'

describe('test new features', () => {
  let app: HooksApplication
  beforeAll(async () => {
    const cwd = process.cwd()
    process.chdir(join(__dirname, '../../'))
    app = await createApp()
    process.chdir(cwd)
  })

  afterAll(async () => {
    await app.close()
  })

  it('runFunction', async () => {
    expect(await app.runFunction(api)).toMatchInlineSnapshot(`
      Object {
        "message": "Hello World",
        "method": "GET",
      }
    `)
    expect(await app.runFunction(post, 'Jake')).toMatchInlineSnapshot(
      `"postJake"`
    )
  })

  it('request', async () => {
    const response = await app.request(get).expect(200)
    expect(response.text).toMatchInlineSnapshot(`"get"`)
  })
})
