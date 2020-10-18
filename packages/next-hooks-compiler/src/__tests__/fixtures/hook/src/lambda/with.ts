import { withMiddleware, useContext } from '@midwayjs/hooks'

export const post = withMiddleware([], async (name: string) => {
  const ctx = useContext()
  console.log(name)
})

export const get = withMiddleware([], async () => {
  const ctx = useContext()
  console.log(name)
})

export default withMiddleware(['staticFile'], async () => {
  const ctx = useContext()
  return 'xxx'
})
