import { BaseTrigger } from '@midwayjs/hooks-core'
import { CreateOptions } from '../../internal'

export interface HooksTrigger
  extends BaseTrigger,
    Pick<
      CreateOptions,
      'parseArgs' | 'handlerDecorators' | 'classDecorators'
    > {}
