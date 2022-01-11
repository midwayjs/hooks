import { deprecate } from 'util'
import {
  Api,
  ApiFunction,
  HooksMiddleware,
  Middleware,
  validateArray,
  validateFunction,
} from '@midwayjs/hooks-core'

type Controller = {
  middleware?: HooksMiddleware[]
}

/**
 * @deprecated Use `Api(Middleware(...middlewares))` instead
 */
export const withController = deprecate(
  <T extends ApiFunction>(controller: Controller, func: T) => {
    if (controller?.middleware !== undefined) {
      validateArray(controller.middleware, 'controller.middleware')
    }
    validateFunction(func, 'func')
    return Api(Middleware(controller.middleware), func)
  },
  'withController is deprecated. Use `Api(Middleware(...middlewares))` instead.'
)

/**
 * @deprecated Use `Api(Middleware(...middlewares))` instead
 */
export const withMiddleware = deprecate(
  <T extends ApiFunction>(middleware: HooksMiddleware[], func: T) => {
    validateArray(middleware, 'middleware')
    validateFunction(func, 'func')
    return Api(Middleware(middleware), func)
  },
  'withMiddleware is deprecated. Use `Api(Middleware(...middlewares))` instead.'
)
