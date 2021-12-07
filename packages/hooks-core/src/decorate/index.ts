import 'reflect-metadata'

import { AsyncFunction, validateFunction } from '../'
import { compose } from './compose'
import {
  ArrayToObject,
  DefineHelper,
  ExecuteHelper,
  ExtractInputType,
  Operator,
  DecorateHandler,
} from './type'

export function Decorate<
  Operators extends Operator<any>[],
  Handler extends AsyncFunction
>(
  ...args: [...operators: Operators, handler: Handler]
): DecorateHandler<
  ExtractInputType<Operators> extends void[]
    ? void
    : ArrayToObject<ExtractInputType<Operators>>,
  Handler
> {
  const handler = args.pop() as Function
  validateFunction(handler, 'DecorateHandler')

  const operators = args as Operator<any>[]
  const requireInput = operators.some((operator) => operator.requireInput)

  const stack = []
  // TODO Direct call or frontend end invoke
  const executor = function DecoratorExecutor(...args: any[]) {
    const funcArgs = requireInput ? args.slice(1) : args
    stack.push(async (helper: ExecuteHelper) => {
      helper.result = await handler(...funcArgs)
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

  Reflect.defineMetadata('isDecorate', true, executor)
  return executor as any
}
