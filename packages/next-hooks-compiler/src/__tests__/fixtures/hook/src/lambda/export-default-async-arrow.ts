import { useContext, useInject } from '@midwayjs/hooks'

export default async () => {
  const ctx = useContext()
  const baseDir = await useInject('baseDir')
  return ctx.path + baseDir
}
