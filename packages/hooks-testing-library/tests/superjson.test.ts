import path from 'path'

import { createApp, HooksApplication } from '../src'
import { CustomError } from './fixtures/superjson/src/error/custom'
import {
  returnString,
  returnObject,
  getContext,
  get,
  post,
  returnError,
  throwError,
  throwCustomError,
} from './fixtures/superjson/src/lambda/index'

let app: HooksApplication
beforeAll(async () => {
  app = await createApp({
    root: path.join(__dirname, './fixtures/superjson'),
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

  test('return error', async () => {
    expect(await app.runFunction(returnError)).toMatchSnapshot()
  })

  test('throw error', async () => {
    try {
      await app.runFunction(throwError)
    } catch (error) {
      expect(error instanceof Error)
      expect(error).toMatchSnapshot()
    }
  })

  test('throw custom error', async () => {
    try {
      await app.runFunction(throwCustomError)
    } catch (error) {
      expect(error instanceof CustomError)
      expect(error).toMatchSnapshot()
    }
  })
})
