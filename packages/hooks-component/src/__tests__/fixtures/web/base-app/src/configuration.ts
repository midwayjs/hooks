import { Configuration, App } from '@midwayjs/decorator'
import { createHooksComponent } from '../../../../../index'
import { Application } from '@midwayjs/koa'
import bodyParser from 'koa-bodyparser'

@Configuration({
  imports: [
    createHooksComponent({
      source: 'src',
      routes: [
        {
          baseDir: 'lambda',
          basePath: '/api',
        },
      ],
    } as any),
  ],
  importConfigs: ['./config'],
})
export class ContainerConfiguration {
  @App()
  app: Application

  async onReady() {
    this.app.use(bodyParser())
  }
}
