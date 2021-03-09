import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library'
import api, { get, getPath, post } from '.'

describe('test new features', () => {
  let app: HooksApplication
  beforeAll(async () => {
    app = await createApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('runFunction', async () => {
    expect(await app.runFunction(api)).toMatchInlineSnapshot(`"Hello World"`)
    expect(await app.runFunction(getPath)).toMatchInlineSnapshot(
      `"/api/getPath"`
    )
    expect(await app.runFunction(post, 'Jake')).toMatchInlineSnapshot(`
      Object {
        "method": "POST",
        "name": "Jake",
      }
    `)
  })

  it('request', async () => {
    const response = await app.request(get).expect(200)
    expect(response.text).toMatchInlineSnapshot(`"GET"`)

    const postResponse = await app.request(post, 'lxxyx').expect(200)
    expect(postResponse.body).toMatchInlineSnapshot(`
      Object {
        "method": "POST",
        "name": "lxxyx",
      }
    `)
  })
})
