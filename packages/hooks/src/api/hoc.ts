import { deprecate } from 'util'

import {
  ApiFunction,
  HooksMiddleware,
  Middleware,
  Decorate,
  validateArray,
  validateFunction,
} from '@midwayjs/hooks-core'

type Controller = {
  middleware?: HooksMiddleware[]
}

/**
 * @deprecated Use `Pipe(Middleware(...middlewares))` instead
 */
export const withController = deprecate(
  <T extends ApiFunction>(controller: Controller, func: T) => {
    if (controller?.middleware !== undefined) {
      validateArray(controller.middleware, 'controller.middleware')
    }
    validateFunction(func, 'func')

    return Decorate(Middleware(controller.middleware), func)
  },
  'withController is deprecated. Use `Pipe(Middleware(...middlewares))` instead.'
)

/**
 * @deprecated Use `Pipe(Middleware(...middlewares))` instead
 */
export const withMiddleware = deprecate(
  <T extends ApiFunction>(middleware: HooksMiddleware[], func: T) => {
    validateArray(middleware, 'middleware')
    validateFunction(func, 'func')

    return Decorate(Middleware(middleware), func)
  },
  'withMiddleware is deprecated. Use `Pipe(Middleware(...middlewares))` instead.'
)
