import path from 'upath'
import { hintConfig } from '../hintConfig'
import { compileHooks } from '../index'
import { clearRoutes, getFunctionsMeta } from '../routes'

describe('Compiler Features', () => {
  beforeAll(async () => {
    const fixture = path.resolve(__dirname, './fixtures/remove-underscore')
    await compileHooks(fixture, hintConfig)
  })

  it('The routing information should have the underscore removed', () => {
    expect(getFunctionsMeta()).toMatchSnapshot()
  })

  afterAll(() => {
    clearRoutes()
  })
})
