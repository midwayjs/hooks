import { InvalidReferenceError } from '../errors/InvalidReference'
import { BuiltinHooksError } from '../errors/BuiltinHooks'
import { compileFixture } from './util'

describe('compile error case', () => {
  test('hook allows use only in serverless functions or other hooks.', async () => {
    expect(compileFixture('compile-error/invalid-reference')).rejects.toBeInstanceOf(InvalidReferenceError)
  })

  test('only builtin hooks is allowed', async () => {
    expect(compileFixture('compile-error/builtin-hooks')).rejects.toBeInstanceOf(BuiltinHooksError)
  })
})
