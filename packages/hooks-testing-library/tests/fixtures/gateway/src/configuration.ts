import bodyParser from 'koa-bodyparser'

import { hooks, createConfiguration } from '@midwayjs/hooks'

import { CustomGateway } from './custom'

export default createConfiguration({
  imports: [
    hooks({
      gatewayAdapters: [CustomGateway],
      middleware: [bodyParser()],
    }),
  ],
})
