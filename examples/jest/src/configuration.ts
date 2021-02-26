import { Configuration, App } from '@midwayjs/decorator'
import { hooks } from '@midwayjs/hooks-core'
import { Application } from '@midwayjs/koa'
import bodyParser from 'koa-bodyparser'

@Configuration({
  imports: [
    hooks({
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
