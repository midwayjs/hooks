import path from 'path'

import { IMidwayApplication } from '@midwayjs/core'

import { createApp, HooksApplication } from '../src'

let app: HooksApplication
beforeAll(async () => {
  app = await createApp({
    root: path.join(__dirname, './fixtures/gateway'),
  })
})

afterAll(async () => {
  await app.close()
})

test('custom gateway', async () => {
  const iapp: IMidwayApplication<any> = (app as any).app
  expect(iapp.getApplicationContext().get('custom')).toEqual(
    'custom gateway response'
  )
})
