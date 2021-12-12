import parseFunctionArgs from 'fn-args'
import isFunction from 'lodash/isFunction'
import pickBy from 'lodash/pickBy'
import { run } from '@midwayjs/glob'
import {
  ApiModule,
  EXPORT_DEFAULT_FUNCTION_ALIAS,
  FunctionId,
  HooksMiddleware,
} from '../'
import { Decorate } from '../decorate/decorate'
import { Get, HttpTrigger, Post } from '../decorate/operator/http'
import { OperatorType } from '../decorate/type'
import { Route } from '../types'
import { FileRouter } from './router'

export type LoadConfig = {
  root: string
  source: string
  routes: Route[]
}

type BaseTrigger = {
  type: string
  [key: string]: any
}

type Trigger = BaseTrigger & HTTPTrigger

interface HTTPTrigger extends BaseTrigger {
  type: typeof HttpTrigger
  method:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'HEAD'
    | 'OPTIONS'
    | 'ALL'
  path: string
}

export type AsyncFunction = (...args: any[]) => Promise<any>

export type ApiRoute = {
  fn: AsyncFunction
  trigger: Trigger
  middleware: HooksMiddleware[]
  functionId: FunctionId
  route: Route
}

export function loadApiRoutes(config: LoadConfig): ApiRoute[] {
  const router = new FileRouter(config)

  const files = run(['**/*.{ts,tsx,js,jsx,mjs}'], {
    cwd: router.source,
    ignore: [
      '**/*.test.{ts,tsx,js,jsx,mjs}',
      '**/*.spec.{ts,tsx,js,jsx,mjs}',
      '**/*.d.{ts,tsx}',
      '**/node_modules/**',
    ],
  }).filter((file) => router.isApiFile(file))

  const routes: ApiRoute[] = []
  for (const file of files) {
    const fileRoutes = loadApiRoutesFromFile(require(file), file, router)
    routes.push(...fileRoutes)
  }

  return routes
}

export function loadApiRoutesFromFile(
  mod: ApiModule,
  file: string,
  router: FileRouter
) {
  const apiRoutes: ApiRoute[] = []
  const funcs = pickBy(mod, isFunction)

  for (let [name, fn] of Object.entries(funcs)) {
    const exportDefault = name === 'default'
    const functionName = exportDefault ? EXPORT_DEFAULT_FUNCTION_ALIAS : name
    const functionId = router.getFunctionId(file, functionName, exportDefault)

    // default is http trigger
    let trigger: Trigger = Reflect.getMetadata(OperatorType.Trigger, fn)

    if (!trigger) {
      // default is http
      const Method = parseFunctionArgs(fn).length === 0 ? Get : Post
      // wrap pure function
      fn = Decorate(Method(), fn)
      // get trigger
      trigger = Reflect.getMetadata(OperatorType.Trigger, fn)
    }

    if (trigger.type === HttpTrigger) {
      trigger.path = router.functionToHttpPath(
        file,
        functionName,
        exportDefault
      )
    }

    const fnMiddleware = Reflect.getMetadata(OperatorType.Middleware, fn) || []
    const fileMiddleware = mod?.config?.middleware || []
    const middleware = [...fnMiddleware, ...fileMiddleware]

    apiRoutes.push({
      fn,
      trigger,
      functionId,
      middleware,
      route: router.getRoute(file),
    })
  }

  return apiRoutes
}
