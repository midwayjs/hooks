import { InvalidReferenceError } from '../InvalidReference'
import { BuiltinHooksError } from '../BuiltinHooks'
import { resolve } from 'upath'
import { compileHooks } from '../../__tests__/util'

describe('compile error case', () => {
  test('hook allows use only in serverless functions or other hooks.', async () => {
    const fixture = resolve(__dirname, 'fixtures/invalid-reference')
    expect(compileHooks(fixture)).rejects.toBeInstanceOf(InvalidReferenceError)
  })

  test('only builtin hooks is allowed', async () => {
    const fixture = resolve(__dirname, 'fixtures/builtin-hooks')
    expect(compileHooks(fixture)).rejects.toBeInstanceOf(BuiltinHooksError)
  })
})
