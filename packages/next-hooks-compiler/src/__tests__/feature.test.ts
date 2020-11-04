import path from 'upath'
import { hintConfig } from '../hintConfig'
import { compileHooks } from './util'
import { clearRoutes, getFunctionsMeta } from '../routes'

describe('features', () => {
  beforeAll(async () => {
    const fixture = path.resolve(__dirname, './fixtures/remove-underscore')
    await compileHooks(fixture, hintConfig)
  })

  it('remove underscore', () => {
    expect(getFunctionsMeta()).toMatchSnapshot()
  })

  afterAll(() => {
    clearRoutes()
  })
})
