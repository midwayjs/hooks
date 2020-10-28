import { useContext, withController } from '@midwayjs/hooks'

export default withController(
  {
    middleware: ['staticFile'],
  },
  async (name: string) => {
    const ctx = useContext()
    return 'xxx'
  }
)
