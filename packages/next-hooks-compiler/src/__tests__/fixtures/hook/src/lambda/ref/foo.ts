import { useContext } from '@midwayjs/hooks'

export type Foo = any

export async function refFoo() {
  const ctx = useContext()
}
