import { Configuration, App, Inject } from '@midwayjs/decorator'
import { hooks } from '@midwayjs/hooks'
import { IMidwayFaaSApplication } from '@midwayjs/faas'
import staticCache from 'koa-static-cache'
import { join } from 'path'

@Configuration({
  imports: [hooks()],
})
export class ContainerConfiguration {
  @App()
  private app!: IMidwayFaaSApplication

  @Inject()
  baseDir!: string

  async onReady() {
    this.app.use(
      staticCache({
        dir: join(this.baseDir, '../build'),
        dynamic: true,
        alias: {
          '/': 'index.html',
        },
        buffer: true,
      })
    )
  }
}
