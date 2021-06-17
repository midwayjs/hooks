import path from 'path'

import { createApp, HooksApplication } from '../src'
import {
  returnString,
  returnObject,
  getContext,
  get,
  post,
} from './fixtures/core/src/lambda/index'
import { tryInject, tryInjectLocal } from './fixtures/core/src/lambda/ioc'
import middleware from './fixtures/core/src/lambda/middleware'
import { underscore } from './fixtures/core/src/underscore'

let app: HooksApplication
beforeAll(async () => {
  app = await createApp({
    root: path.join(__dirname, './fixtures/core'),
  })
})

afterAll(async () => {
  await app.close()
})

describe('Hooks Api', () => {
  test('HTTP GET', async () => {
    expect(await app.runFunction(get)).toMatchSnapshot()
  })

  test('HTTP POST', async () => {
    expect(await app.runFunction(post, 'Lxxyx')).toMatchSnapshot()
  })

  test('return string', async () => {
    expect(await app.runFunction(returnString)).toMatchSnapshot()
  })

  test('return object', async () => {
    expect(await app.runFunction(returnObject)).toMatchSnapshot()
  })

  test('get request context', async () => {
    expect(await app.runFunction(getContext)).toMatchSnapshot()
  })

  // TODO Handle HTTP Error

  test('underscore', async () => {
    const { path } = await app.runFunction(underscore)
    return expect(path).toEqual('/underscore/_underscore')
  })

  test('middleware', async () => {
    const response = await app.request(middleware).expect(200)
    // Set by middleware
    expect(response.headers.global).toBeTruthy()
    expect(response.headers.file).toBeTruthy()
    expect(response.headers.api).toBeTruthy()
  })

  test('IoC', async () => {
    expect(await app.runFunction(tryInject)).toMatchSnapshot()
    expect(await app.runFunction(tryInjectLocal)).toMatchSnapshot()
  })
})
