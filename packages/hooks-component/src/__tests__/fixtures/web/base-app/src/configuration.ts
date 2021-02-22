import { Configuration } from '@midwayjs/decorator'
import { createHooks } from '../../../../../index'

@Configuration({
  imports: [
    createHooks({
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
export class ContainerConfiguration {}
