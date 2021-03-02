import { Configuration, App } from '@midwayjs/decorator'
import { hooks } from '@midwayjs/hooks'
import { Application } from '@midwayjs/koa'

@Configuration({
  imports: [hooks()],
})
export class ContainerConfiguration {
  @App()
  private app!: Application

  async onReady() {
    this.app.use(require('koa-bodyparser')())
  }
}
