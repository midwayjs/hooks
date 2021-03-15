import { ApiConfig, withController } from '@midwayjs/hooks'
import { createLogger } from '../middleware'

// File Level Middleware
export const config: ApiConfig = {
  middleware: [createLogger('File')],
}

// Function Level Middleware
export default withController(
  { middleware: [createLogger('Api')] },
  async () => {
    return {
      message: 'Hello World',
      framework: '@midwayjs/hooks',
    }
  }
)
