import parseFunctionArgs from 'fn-args'
import isFunction from 'lodash/isFunction'
import pickBy from 'lodash/pickBy'
import {
  ApiModule,
  EXPORT_DEFAULT_FUNCTION_ALIAS,
  FunctionId,
  HooksMiddleware,
} from '../'
import { USE_INPUT_METADATA } from '../common/const'
import {
  Api,
  BaseTrigger,
  Get,
  HttpTrigger,
  HttpTriggerType,
  OperatorType,
  Post,
} from '../api'
import { ApiFunction, Route } from '../types'
import { AbstractRouter } from './base'
import { createDebug } from '../common'

const debug = createDebug('hooks-core: loader')

export type LoadConfig = {
  root: string
  source: string
  routes: Route[]
}

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
  const funcs = pickBy(mod, isFunction)
  for (let [name, fn] of Object.entries(funcs)) {
    const exportDefault = name === 'default'
    const functionName = exportDefault ? EXPORT_DEFAULT_FUNCTION_ALIAS : name
    const functionId = router.getFunctionId(file, functionName, exportDefault)

    // default is http trigger
    let trigger: Trigger = Reflect.getMetadata(OperatorType.Trigger, fn)

    if (!trigger) {
      // default is http
      const HttpMethod = parseFunctionArgs(fn).length === 0 ? Get : Post
      // wrap pure function
      fn = Api(HttpMethod(), fn)
      mod[name] = fn
      // get trigger
      trigger = Reflect.getMetadata(OperatorType.Trigger, fn)
    }

    if (trigger.type === HttpTriggerType) {
      trigger.path ??= router.functionToHttpPath(
        file,
        functionName,
        exportDefault
      )
      debug('trigger: %o', trigger)
    }

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
