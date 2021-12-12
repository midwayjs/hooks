import 'reflect-metadata'
import { AsyncFunction, validateFunction } from '../'
import { adapter } from '../adapter'
import { IS_DECORATE } from '../const'
import { compose } from './compose'
import { HttpMetadata } from './operator/http'
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
  const requireInput = operators.some((operator) => operator.input)

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
      HttpMetadata.RESPONSE,
      executor
    )
    if (Array.isArray(responseMetadata)) {
      await adapter.handleResponseMetaData(responseMetadata)
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
    getMetadata(key: any) {
      return Reflect.getMetadata(key, executor)
    },
    setMetadata(key: any, value: any) {
      return Reflect.defineMetadata(key, value, executor)
    },
  }

  for (const operator of operators) {
    if (operator.metadata) {
      validateFunction(operator.metadata, 'operator.metadata')
      operator.metadata(defineHelper)
    }
  }

  Reflect.defineMetadata(IS_DECORATE, true, executor)
  return executor as any
}
