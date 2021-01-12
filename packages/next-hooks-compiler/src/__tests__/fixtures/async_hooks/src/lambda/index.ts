import { useContext } from '@midwayjs/hooks'

export default async function lambda(name: string) {
  const ctx = useContext()
  return ctx.path
}
