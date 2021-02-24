import { Configuration, App } from '@midwayjs/decorator'
import { createHooksComponent } from '@midwayjs/hooks-component'
import { Application } from '@midwayjs/koa'
import bodyParser from 'koa-bodyparser'

@Configuration({
  imports: [
    createHooksComponent({
      source: '/src',
      routes: [
        {
          baseDir: 'lambda',
          basePath: '/api',
        },
      ],
    }),
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
