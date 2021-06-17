import { useContext } from '@midwayjs/hooks'

export const underscore = async () => {
  const ctx = useContext()
  return {
    path: ctx.path,
  }
}
