import 'reflect-metadata'
import { AsyncFunction, validateFunction } from '../'
import { IS_DECORATE } from '../const'
import { HooksFramework } from '../framework'
import { compose } from './compose'
import { HttpProperty } from './operator/http'
import {
  ArrayToObject,
  DecorateHandler,
  DefineHelper,
  ExecuteHelper,
  ExtractInputType,
  Operator,
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
  const executor = async function DecoratorExecutor(...args: any[]) {
    const funcArgs = requireInput ? args.slice(1) : args

    let result: any
    stack.push(async ({ next }: ExecuteHelper) => {
      result = await handler(...funcArgs)
      return next()
    })

    await compose(stack, { getInputArguments: () => funcArgs })()
    const responseMetadata = Reflect.getMetadata(
      HttpProperty.RESPONSE,
      executor
    )
    if (Array.isArray(responseMetadata)) {
      await HooksFramework.getFramework().handleResponseMetaData(
        responseMetadata
      )
    }
    return result
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

  Reflect.defineMetadata(IS_DECORATE, true, executor)
  return executor as any
}
