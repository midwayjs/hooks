import parseFunctionArgs from 'fn-args'
import isFunction from 'lodash/isFunction'
import pickBy from 'lodash/pickBy'
import { join } from 'upath'

import { run } from '@midwayjs/glob'

import {
  PipeFunction,
  EXPORT_DEFAULT_FUNCTION_ALIAS,
  FunctionId,
  HooksMiddleware,
  useHooksMiddleware,
} from '../'
import { OperatorProperty } from '../pipe/type'
import { NewFileRouter } from './new-router'

type LoadConfig = {
  root: string
  source: string
}

type BaseTrigger = {
  type: string
  [key: string]: any
}

type Trigger = BaseTrigger & HTTPTriger

interface HTTPTriger extends BaseTrigger {
  type: 'HTTP'
  method:
    | 'get'
    | 'post'
    | 'put'
    | 'delete'
    | 'patch'
    | 'head'
    | 'options'
    | 'all'
  path: string
}

type ApiRoute = {
  function: PipeFunction
  trigger: Trigger
  middleware: HooksMiddleware[]
  functionId: FunctionId
}

export async function loadApiRoutes(config: LoadConfig): Promise<ApiRoute[]> {
  const router = new NewFileRouter({
    root: config.root,
    source: config.source,
    routes: [],
  })

  const files = run([join(router.source, '**/*.{ts,tsx,js,jsx,mjs}')], {
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
    const fileRoutes = loadFileApiRoutes(require(file), file, router)
    routes.push(...fileRoutes)
  }
  return routes
}

export function loadFileApiRoutes(
  mod: any,
  file: string,
  router: NewFileRouter
) {
  const apiRoutes: ApiRoute[] = []
  const fileMiddleware = mod?.config?.middleware || []

  const funcs = pickBy<PipeFunction>(mod, isFunction)

  for (let [name, fn] of Object.entries(funcs)) {
    const exportDefault = name === 'default'
    const functionName = exportDefault ? EXPORT_DEFAULT_FUNCTION_ALIAS : name
    const functionId = router.getFunctionId(file, functionName, exportDefault)

    const trigger: Trigger = fn.meta.get(OperatorProperty.Trigger)
    // special case for http trigger
    if (trigger.type === 'HTTP') {
      if (!fn.isPipe) {
        trigger.method = parseFunctionArgs(fn).length > 0 ? 'post' : 'get'
      }
      trigger.path = router.fileToHttpPath(file, functionName, exportDefault)
    }

    const fnMiddleware = fn.meta.get(OperatorProperty.Middleware) || []
    const middleware = fnMiddleware
      .concat(fileMiddleware)
      .map(useHooksMiddleware)

    apiRoutes.push({ function: fn, trigger, functionId, middleware })
  }

  return apiRoutes
}
