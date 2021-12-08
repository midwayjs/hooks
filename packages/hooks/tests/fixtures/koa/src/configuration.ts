import bodyParser from 'koa-bodyparser'

import { createConfiguration, hooks } from '../../../../src'
import { createLogger } from './middleware'

export default createConfiguration({
  imports: [
    hooks({
      middleware: [bodyParser(), createLogger('Global')],
    }),
  ],
})
