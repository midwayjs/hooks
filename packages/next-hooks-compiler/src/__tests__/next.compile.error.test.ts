import { InvalidReferenceError } from '../errors/InvalidReference'
import { BuiltinHooksError } from '../errors/BuiltinHooks'
import { compileFixture } from './util'

describe('Hooks 错误使用情况', () => {
  test('Lambda 只允许在 Lambda 或 Hook 中引用', () => {
    expect(compileFixture('invalid-reference')).rejects.toBeInstanceOf(InvalidReferenceError)
  })

  test('内置 Hooks 只允许编译支持的类型', async () => {
    expect(compileFixture('builtin-hooks')).rejects.toBeInstanceOf(BuiltinHooksError)
  })
})
