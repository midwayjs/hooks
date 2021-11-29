import 'reflect-metadata'

import { AsyncFunction, validateFunction } from '../'
import { compose } from './compose'
import {
  ArrayToObject,
  DefineHelper,
  ExecuteHelper,
  ExtractInputType,
  Operator,
  PipeHandler,
} from './type'

export function Pipe<
  Operators extends Operator<any>[],
  Handler extends AsyncFunction
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
  // TODO Direct call or frontend end invoke
  const executor = function PipeExecutor(...args: any[]) {
    const funcArgs = requireInput ? args.slice(1) : args
    stack.push(async (helper: ExecuteHelper) => {
      const result = await handler(...funcArgs)
      helper.result = result
      return helper.next()
    })
    return compose(stack, { getInputArguments: () => funcArgs })()
  }

  for (const operator of operators) {
    if (operator.execute) {
      validateFunction(operator.execute, 'operator.execute')
      stack.push(operator.execute)
    }
  }

  const defineHelper: DefineHelper = {
    getProperty(key: any) {
      return Reflect.getMetadata(key, executor)
    },
    setProperty(key: any, value: any) {
      return Reflect.defineMetadata(key, value, executor)
    },
  }

  for (const operator of operators) {
    if (operator.defineMeta) {
      validateFunction(operator.defineMeta, 'operator.defineMeta')
      operator.defineMeta(defineHelper)
    }
  }

  Reflect.defineMetadata('isPipe', true, executor)
  return executor as any
}
