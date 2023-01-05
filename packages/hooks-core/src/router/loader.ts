import pickBy from 'lodash/pickBy'
import {
  ApiModule,
  EXPORT_DEFAULT_FUNCTION_ALIAS,
  FunctionId,
  HooksMiddleware,
} from '../'
import { USE_INPUT_METADATA } from '../common/const'
import {
  BaseTrigger,
  HttpTrigger,
  HttpTriggerType,
  isApiFunction,
  OperatorType,
} from '../api'
import { ApiFunction } from '../types'
import { AbstractRouter } from './base'
import { createDebug } from '../common'

const debug = createDebug('hooks-core: loader')

type Trigger = BaseTrigger | HttpTrigger

export type ApiRoute<T = BaseTrigger> = {
  fn: ApiFunction
  file: string
  functionName: string

  trigger: T
  middleware: HooksMiddleware[]
  functionId: FunctionId
  useInputMetadata?: boolean
}

export function parseApiModule(
  mod: ApiModule,
  file: string,
  router: AbstractRouter
) {
  const apis: ApiRoute[] = []
  for (const [name, fn] of Object.entries(pickBy(mod, isApiFunction))) {
    const exportDefault = name === 'default'
    const functionName = exportDefault ? EXPORT_DEFAULT_FUNCTION_ALIAS : name
    const functionId = router.getFunctionId(file, functionName, exportDefault)

    const trigger: Trigger = Reflect.getMetadata(OperatorType.Trigger, fn)

    // Http Trigger
    if (trigger.type === HttpTriggerType) {
      trigger.path ??= router.functionToHttpPath(
        file,
        functionName,
        exportDefault
      )
      debug('trigger: %o', trigger)
    }

    // Middleware
    const fnMiddleware = Reflect.getMetadata(OperatorType.Middleware, fn) || []
    const fileMiddleware = mod?.config?.middleware || []
    const middleware = [...fnMiddleware, ...fileMiddleware]

    apis.push({
      fn,
      file,
      functionName,
      functionId,
      trigger,
      middleware,
      useInputMetadata: Reflect.getMetadata(USE_INPUT_METADATA, fn),
    })
  }

  return apis
}
