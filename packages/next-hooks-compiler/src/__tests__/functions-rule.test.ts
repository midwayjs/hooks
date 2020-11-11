import path from 'upath'
import { compileHooks } from './util'
import { getFunctionsMeta } from '../routes'
import { wrap } from 'jest-snapshot-serializer-raw'

describe('functions rule support', () => {
  beforeAll(async () => {
    const fixture = path.resolve(__dirname, './fixtures/functions-rule')
    await compileHooks(fixture)
  })

  it('routes', () => {
    expect(wrap(JSON.stringify(getFunctionsMeta(), null, 2))).toMatchSnapshot()
  })
})
