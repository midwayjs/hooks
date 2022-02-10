import 'reflect-metadata'
import { AsyncFunction, validateFunction } from '../'
import { USE_INPUT_METADATA } from '../common/const'
import compose from 'koa-compose'
import { HttpMetadata } from './operator/http'
import {
  ApiRunner,
  ArrayToObject,
  ExecuteHelper,
  ExtractInputType,
  MetadataHelper,
  Operator,
} from './type'
import { framework } from '../adapter'

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

  const useInputMetadata = operators.some((operator) => operator.input)
  const executors = operators
    .filter((operator) => typeof operator.execute === 'function')
    .map((operator) => operator.execute)

  async function runner(...args: any[]) {
    const stack = [...executors]

    const executeHelper: ExecuteHelper = {
      result: undefined,
      getInputArguments: () => args,
    }

    stack.push(async (helper: ExecuteHelper, next: any) => {
      helper.result = await handler(...args)
      return next()
    })

    await compose(stack)(executeHelper)

    // handle HttpCode/Redirect/etc.
    const responseMetadata = Reflect.getMetadata(HttpMetadata.RESPONSE, runner)
    if (Array.isArray(responseMetadata)) {
      await framework.handleResponseMetaData(responseMetadata)
    }
    return executeHelper.result
  }

  Reflect.defineMetadata(USE_INPUT_METADATA, useInputMetadata, runner)
  return runner as any
}
