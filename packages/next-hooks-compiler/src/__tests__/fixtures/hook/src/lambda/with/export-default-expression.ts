import { useContext, withController } from '@midwayjs/hooks'

export default withController(
  {
    middleware: ['staticFile'],
  },
  async function () {
    const ctx = useContext()
    return 'xxx'
  }
)
