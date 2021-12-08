import bodyParser from 'koa-bodyparser'

import { createConfiguration, hooks } from '@midwayjs/hooks'

export default createConfiguration({
  imports: [
    hooks({
      middleware: [bodyParser()],
    }),
  ],
})
