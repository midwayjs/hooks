import express from 'express'
import { createExpressDevPack } from '../middleware'
import { resolve } from 'path'
import supertest from 'supertest'
import { useRandomPort } from './util'

beforeEach(async () => {
  await useRandomPort()
})

test('dev pack middleware', async () => {
  const { middleware, server } = await createExpressDevPack({
    cwd: resolve(__dirname, 'fixtures/api'),
    sourceDir: resolve(__dirname, 'fixtures/api/src'),
    watch: false,
  })

  const app = express()
  app.use(middleware)

  {
    const res = await supertest(app).get('/').expect(200)
    expect(res.body.message).toEqual('Hello World!')
  }

  app.get('/express_only', (req, res, next) => {
    res.send('handle by express')
  })

  {
    const res = await supertest(app).get('/express_only').expect(200)
    expect(res.text).toEqual('handle by express')
  }

  {
    const res = await supertest(app).get('/api/query?foo=bar').expect(200)
    expect(res.body.query).toEqual({ foo: 'bar' })
  }

  {
    const res = await supertest(app).get('/api/jake').expect(200)
    expect(res.body.id).toEqual('jake')
  }

  await server.close('middleware test')
})

test('image', async () => {
  const { middleware, server } = await createExpressDevPack({
    cwd: resolve(__dirname, 'fixtures/api-image'),
    sourceDir: resolve(__dirname, 'fixtures/api-image/src'),
    watch: false,
  })

  const app = express()
  app.use(middleware)

  {
    const res = await supertest(app).get('/image').expect(200)
    expect(res.header['content-type']).toEqual('image/png')
  }

  await server.close('middleware test')
})
