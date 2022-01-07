import 'reflect-metadata'
import { AsyncFunction, validateFunction } from '../'
import { framework } from '../adapter/framework'
import { USE_INPUT_METADATA } from '../common/const'
import { compose } from './compose'
import { HttpMetadata } from './operator/http'
import {
  ApiRunner,
  ArrayToObject,
  ExecuteHelper,
  ExtractInputType,
  MetadataHelper,
  Operator,
} from './type'

export function Api<
  Operators extends Operator<any>[],
  Handler extends AsyncFunction
>(
  ...args: [...operators: Operators, handler: Handler]
): ApiRunner<
  ExtractInputType<Operators> extends void[]
    ? void
    : ArrayToObject<ExtractInputType<Operators>>,
  Handler
> {
  const handler = args.pop() as Function
  validateFunction(handler, 'ApiHandler')

  const operators = args as Operator<any>[]
  const useInputMetadata = operators.some((operator) => operator.input)

  const stack = []
  // TODO Direct call or frontend end invoke
  const runner = async (...args: any[]) => {
    const funcArgs = useInputMetadata ? args.slice(0, -1) : args

    let result: any
    stack.push(async ({ next }: ExecuteHelper) => {
      result = await handler(...funcArgs)
      return next()
    })

    await compose(stack, { getInputArguments: () => funcArgs })()

    // handle HttpCode/Redirect/etc.
    const responseMetadata = Reflect.getMetadata(HttpMetadata.RESPONSE, runner)
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
      return Reflect.getMetadata(key, runner)
    },
    setMetadata(key: any, value: any) {
      return Reflect.defineMetadata(key, value, runner)
    },
  }

  for (const operator of operators) {
    if (operator.metadata) {
      validateFunction(operator.metadata, 'operator.metadata')
      operator.metadata(metadataHelper)
    }
  }

  Reflect.defineMetadata(USE_INPUT_METADATA, useInputMetadata, runner)
  return runner as any
}
