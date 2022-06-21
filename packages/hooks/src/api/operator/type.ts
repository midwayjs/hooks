import { BaseTrigger } from '@midwayjs/hooks-core'
import { CreateOptions } from '../container'

export interface HooksTrigger
  extends BaseTrigger,
    Pick<
      CreateOptions,
      'parseArgs' | 'handlerDecorators' | 'classDecorators'
    > {}
