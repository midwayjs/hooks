import {
  closeApp,
  createApp,
  createHttpRequest,
  IMidwayKoaApplication,
} from '@midwayjs/test-util'
import { join } from 'path'

describe('serve handler', () => {
  let app: IMidwayKoaApplication

  beforeAll(async () => {
    const fixture = join(__dirname, 'fixtures', 'api')
    app = await createApp(fixture)
  })

  afterAll(async () => {
    await closeApp(app)
  })

  test('should serve index.html', async () => {
    const request = createHttpRequest(app)
    const response = await request.get('/kit').expect(200)
    expect(response.text.includes('This is Client')).toBeTruthy()
  })
})
