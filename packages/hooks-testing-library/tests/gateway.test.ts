import path from 'path'

import { IMidwayApplication } from '@midwayjs/core'

import { createApp, HooksApplication } from '../src'
import { get } from './fixtures/gateway/src/lambda/index'

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

describe('event gateway', () => {
  test('event gateway - wechat', async () => {
    const iapp: IMidwayApplication<any> = (app as any).app
    const container: any = iapp.getApplicationContext().get('wechat-index')
    expect(await container.handler()).toEqual('Hello Wechat Cloud')
  })

  test('event gateway - wechat with args', async () => {
    const iapp: IMidwayApplication<any> = (app as any).app
    const container: any = iapp
      .getApplicationContext()
      .get('wechat-index-withargs')
    expect(await container.handler({ args: ['Jake'] })).toEqual('Hello Jake')
  })
})

test('http gateway', async () => {
  expect(await app.runFunction(get)).toMatchInlineSnapshot(`"GET"`)
})
