import path from 'upath'
import { hintConfig } from '../hintConfig'
import { compileHooks } from '../index'
import { clearRoutes, getFunctionsMeta } from '../plugin/routes'

describe('Catch All Routes', () => {
  beforeAll(async () => {
    const fixture = path.resolve(__dirname, './fixtures/catch-all')
    await compileHooks(fixture, hintConfig)
  })

  it('Routes should be generated correctly', () => {
    expect(getFunctionsMeta()).toMatchSnapshot()
  })

  afterAll(() => {
    clearRoutes()
  })
})
