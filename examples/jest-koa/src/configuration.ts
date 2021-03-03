import { Configuration, App } from '@midwayjs/decorator'
import { hooks } from '@midwayjs/hooks'
import { Application } from '@midwayjs/koa'
import bodyParser from 'koa-bodyparser'

@Configuration({
  imports: [hooks()],
})
export class ContainerConfiguration {
  @App()
  app!: Application

  async onReady() {
    this.app.use(bodyParser())
  }
}
