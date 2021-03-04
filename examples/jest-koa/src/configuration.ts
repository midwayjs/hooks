import { hooks, createConfiguration } from '@midwayjs/hooks'
import { Application } from '@midwayjs/koa'
import bodyParser from 'koa-bodyparser'

export default createConfiguration({
  imports: [hooks()],
}).onReady((_, app: Application) => {
  app.use(bodyParser())
})
