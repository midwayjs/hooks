import { createConfiguration, hooks } from '../../../../src'
import { createLogger } from './middleware'
import * as Koa from '@midwayjs/koa'

export default createConfiguration({
  imports: [
    Koa,
    hooks({
      middleware: [createLogger('Global')],
    }),
  ],
  importConfigs: [
    {
      default: require('./config/default'),
    },
  ],
})
