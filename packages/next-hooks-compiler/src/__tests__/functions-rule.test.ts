import path from 'upath'
import { hintConfig } from '../hintConfig'
import { compileHooks } from '../index'
import { clearRoutes, getFunctionsMeta } from '../routes'

describe('Compiler FunctionsRule', () => {
  beforeAll(async () => {
    const fixture = path.resolve(__dirname, './fixtures/functions-rule')
    await compileHooks(fixture, hintConfig)
  })

  it('Routes should be generated according to the configured rules', () => {
    expect(getFunctionsMeta()).toMatchSnapshot()
  })

  afterAll(() => {
    clearRoutes()
  })
})
