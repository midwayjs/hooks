import { useContext } from '@midwayjs/hooks'
import { refFoo, Foo } from './foo'

export async function bar() {
  const foo: Foo = ''
  const ctx = useContext()
  refFoo()
}
