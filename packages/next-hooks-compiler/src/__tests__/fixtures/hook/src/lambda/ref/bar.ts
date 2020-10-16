import { useContext } from '@midwayjs/hooks'
import { refFoo } from './foo'

export async function bar() {
  const ctx = useContext()
  refFoo()
}
