import type { RequestArgs, RequestRoute } from '@midwayjs/hooks-core'

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

export function buildRPCArgs(args: any[]) {
  if (!Array.isArray(args)) {
    throw new Error('args must be an array')
  }

  return {
    args,
  }
}
