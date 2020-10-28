import { useContext, withController } from '@midwayjs/hooks'

export const post = withController(
  {
    middleware: [],
  },
  async (name: string) => {
    const ctx = useContext()
    console.log(name)
  }
)

export const get = withController(
  {
    middleware: [],
  },
  async () => {
    const ctx = useContext()
    console.log(name)
  }
)

export default withController(
  {
    middleware: ['staticFile'],
  },
  async () => {
    const ctx = useContext()
    return 'xxx'
  }
)
