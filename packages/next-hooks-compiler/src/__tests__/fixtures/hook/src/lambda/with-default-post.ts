import { useContext, withMiddleware } from '@midwayjs/hooks'

export default withMiddleware(['staticFile'], async (name: string) => {
  const ctx = useContext()
  return 'xxx'
})
