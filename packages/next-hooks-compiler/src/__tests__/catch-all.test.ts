import path from 'upath'
import { hintConfig } from '../hintConfig'
import { compileHooks } from './util'
import { clearRoutes, getFunctionsMeta } from '../routes'

describe('catch all routes', () => {
  beforeAll(async () => {
    const fixture = path.resolve(__dirname, './fixtures/catch-all')
    await compileHooks(fixture, hintConfig)
  })

  it('routes', () => {
    expect(getFunctionsMeta()).toMatchSnapshot()
  })

  afterAll(() => {
    clearRoutes()
  })
})
