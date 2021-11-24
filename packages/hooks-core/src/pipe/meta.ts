import { HooksMiddleware } from '../'
import { Operator, OperatorProperty } from './type'

export function Middleware(middleware: HooksMiddleware[]): Operator<void>
export function Middleware(...args: HooksMiddleware[]): Operator<void>
export function Middleware(...middlewares): Operator<void> {
  let middleware: HooksMiddleware[] = middlewares
  if (Array.isArray(middlewares[0])) {
    middleware = middlewares[0]
  }

  return {
    name: 'Middleware',
    defineMeta({ setProperty: defineProperty }) {
      defineProperty(OperatorProperty.Middleware, middleware)
    },
  }
}
