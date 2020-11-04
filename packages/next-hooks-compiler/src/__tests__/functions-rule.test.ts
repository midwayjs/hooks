import path from 'upath'
import { hintConfig } from '../hintConfig'
import { compileHooks } from './util'
import { clearRoutes, getFunctionsMeta } from '../routes'

describe('functions rule support', () => {
  beforeAll(async () => {
    const fixture = path.resolve(__dirname, './fixtures/functions-rule')
    await compileHooks(fixture, hintConfig)
  })

  it('routes', () => {
    expect(getFunctionsMeta()).toMatchSnapshot()
  })

  afterAll(() => {
    clearRoutes()
  })
})
