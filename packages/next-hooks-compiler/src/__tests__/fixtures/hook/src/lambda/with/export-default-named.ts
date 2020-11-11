import { useContext, withController } from '@midwayjs/hooks'

export default withController(
  {
    middleware: ['staticFile'],
  },
  async function named() {
    const ctx = useContext()
    return 'xxx'
  }
)
