import { useContext, withController } from '@midwayjs/hooks'

export default withController(
  {
    middleware: ['staticFile'],
  },
  async () => {
    const ctx = useContext()
    return 'xxx'
  }
)
