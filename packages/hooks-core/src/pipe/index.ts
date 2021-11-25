import { PipeApiFunction, validateFunction } from '../'
import { compose } from './compose'
import {
  ArrayToObject,
  Operator,
  PipeHandler,
  ExtractInputType,
  DefineHelper,
} from './type'

export function Pipe<
  Operators extends Operator<any>[],
  Handler extends PipeApiFunction
>(
  ...args: [...operators: Operators, handler: Handler]
): PipeHandler<
  ExtractInputType<Operators> extends void[]
    ? void
    : ArrayToObject<ExtractInputType<Operators>>,
  Handler
> {
  const handler = args.pop() as Function
  validateFunction(handler, 'PipeHandler')

  const operators = args as Operator<any>[]
  const requireInput = operators.some((operator) => operator.requireInput)

  const stack = []
  const executor: PipeApiFunction = function PipeExecutor(...args: any[]) {
    const funcArgs = requireInput ? args.slice(1) : args
    stack.push(() => handler(...funcArgs))
    return compose(stack)()
  }

  for (const operator of operators) {
    if (operator.execute) {
      validateFunction(operator.execute, 'operator.execute')
      stack.push(operator.execute)
    }
  }

  const defineHelper: DefineHelper = {
    getProperty(key: any) {
      executor.meta ??= new Map()
      return executor.meta.get(key)
    },
    setProperty(key: any, value: any) {
      executor.meta ??= new Map()
      executor.meta.set(key, value)
    },
  }

  for (const operator of operators) {
    if (operator.defineMeta) {
      validateFunction(operator.defineMeta, 'operator.defineMeta')
      operator.defineMeta(defineHelper)
    }
  }

  executor.isPipe = true
  return executor as any
}
