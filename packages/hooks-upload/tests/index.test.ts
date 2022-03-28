import { IMidwayKoaApplication } from '@midwayjs/koa'
import { closeApp, createApp, createHttpRequest } from './utils'
import path from 'path'

describe('serve handler', () => {
  let app: IMidwayKoaApplication

  beforeAll(async () => {
    app = await createApp('api')
  })

  afterAll(async () => {
    await closeApp(app)
  })

  test('upload', async () => {
    const request = createHttpRequest(app)
    const response = await request
      .post('/upload')
      .attach('file', path.resolve(__dirname, './upload.js'))
      .expect(200)

    expect(Array.isArray(response.body.file))
    const file = response.body.file[0]
    expect(file.filename).toBe('upload.js')
    expect(file.fieldName).toBe('file')
  })

  test('fields', async () => {
    const request = createHttpRequest(app)
    const response = await request
      .post('/fields')
      .attach('file', path.resolve(__dirname, './upload.js'))
      .field('name', 'test')
      .expect(200)

    expect(response.body.fields).toEqual({ name: 'test' })
    expect(response.body.files.file.length).toBeGreaterThan(0)
  })
})
