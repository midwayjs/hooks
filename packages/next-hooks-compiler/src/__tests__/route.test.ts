import path from 'upath'
import { compileHooks } from './util'
import { duplicateWarning } from '../routes'

jest.mock('../routes', () => {
  const mod = jest.requireActual('../routes')
  return {
    ...mod,
    duplicateWarning: jest.fn(),
  }
})

it('duplicate routes warning', async () => {
  const fixture = path.resolve(__dirname, './fixtures/route/duplicate')
  await compileHooks(fixture)
  expect(duplicateWarning).toBeCalledTimes(1)
})
