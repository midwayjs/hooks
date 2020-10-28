import { EnhancedFunc } from './type'

export function withMiddleware<T extends EnhancedFunc>(middleware: any[], func: T): T {
  func.middleware = middleware
  return func
}
