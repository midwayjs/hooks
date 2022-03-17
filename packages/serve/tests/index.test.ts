import { IMidwayKoaApplication } from '@midwayjs/koa'
import { closeApp, createApp, createHttpRequest } from './utils'

describe('serve handler', () => {
  let app: IMidwayKoaApplication

  beforeAll(async () => {
    app = await createApp('api')
  })

  afterAll(async () => {
    await closeApp(app)
  })

  test('should serve index.html', async () => {
    const request = createHttpRequest(app)
    const response = await request.get('/kit').expect(200)
    expect(response.text).toEqual('<h1>This is Client</h1>\n')
  })
})
