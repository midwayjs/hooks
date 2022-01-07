import { HooksMiddleware } from '../../index'
import { Operator, OperatorType } from '../type'

export function Middleware(
  middleware: HooksMiddleware[] | any[]
): Operator<void>
export function Middleware(...args: HooksMiddleware[] | any[]): Operator<void>
export function Middleware(...middlewares): Operator<void> {
  let middleware: HooksMiddleware[] = middlewares
  if (Array.isArray(middlewares[0])) {
    middleware = middlewares[0]
  }

  return {
    name: 'Middleware',
    metadata({ setMetadata }) {
      setMetadata(OperatorType.Middleware, middleware)
    },
  }
}
