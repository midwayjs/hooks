import path from 'upath'
import { hintConfig } from '../hintConfig'
import { compileHooks } from './util'
import { clearRoutes, getFunctionsMeta } from '../routes'
import { wrap } from 'jest-snapshot-serializer-raw'

describe('features', () => {
  beforeAll(async () => {
    const fixture = path.resolve(__dirname, './fixtures/remove-underscore')
    await compileHooks(fixture, hintConfig)
  })

  it('remove underscore', () => {
    expect(wrap(JSON.stringify(getFunctionsMeta(), null, 2))).toMatchSnapshot()
  })

  afterAll(() => {
    clearRoutes()
  })
})
