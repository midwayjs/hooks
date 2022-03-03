import type {
  ApiRoute,
  HttpTrigger,
  RequestArgs,
  RequestRoute,
} from '@midwayjs/hooks-core'

type TranspileApiFunction = {
  (...args: any[]): Promise<any>
  route?: ApiRoute<HttpTrigger>
}

export function parseRequestArgs<T, I = void>(requestArgs: RequestArgs<T, I>) {
  const route = requestArgs[requestArgs.length - 1] as RequestRoute<T>
  if (route.useInputMetadata) {
    return {
      route,
      inputMetadata: requestArgs[requestArgs.length - 2] as I,
      args: requestArgs.slice(0, requestArgs.length - 2),
    }
  }

  return {
    route,
    inputMetadata: null,
    args: requestArgs.slice(0, requestArgs.length - 1),
  }
}

export function args(...inputs: any[]) {
  if (!Array.isArray(inputs)) {
    throw new Error('args must be an array')
  }

  return { args: inputs }
}

export function getHttpTrigger(fn: TranspileApiFunction) {
  return fn.route.trigger
}
