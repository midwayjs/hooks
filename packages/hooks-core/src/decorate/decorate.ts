import 'reflect-metadata'
import { AsyncFunction, validateFunction } from '../'
import { framework } from '../adapter'
import { HAS_METADATA_INPUT } from '../const'
import { compose } from './compose'
import { HttpMetadata } from './operator/http'
import {
  ArrayToObject,
  DecorateHandler,
  ExecuteHelper,
  ExtractInputType,
  MetadataHelper,
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
  const hasMetadataInput = operators.some((operator) => operator.input)

  const stack = []
  // TODO Direct call or frontend end invoke
  const executor = async function DecoratorExecutor(...args: any[]) {
    const funcArgs = hasMetadataInput ? args.slice(1) : args

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
      await framework.handleResponseMetaData(responseMetadata)
    }
    return result
  }

  for (const operator of operators) {
    if (operator.execute) {
      validateFunction(operator.execute, 'operator.execute')
      stack.push(operator.execute)
    }
  }

  const metadataHelper: MetadataHelper = {
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
      operator.metadata(metadataHelper)
    }
  }

  Reflect.defineMetadata(HAS_METADATA_INPUT, hasMetadataInput, executor)
  return executor as any
}
