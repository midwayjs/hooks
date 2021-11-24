import { PipeFunction, validateAsyncFunction, validateFunction } from '../'
import { Post, Query, Header } from './http'
import {
  ArrayToObject,
  Operator,
  PipeHandler,
  ExtractMeta,
  DefineHelper,
} from './type'

export function Pipe<
  Operators extends Operator<any>[],
  Handler extends PipeFunction
>(
  ...args: [...operators: Operators, handler: Handler]
): PipeHandler<
  ExtractMeta<Operators> extends void[]
    ? void
    : ArrayToObject<ExtractMeta<Operators>>,
  Handler
> {
  const handler = args.pop() as PipeFunction
  validateAsyncFunction(handler, 'handler')

  handler.isPipe = true
  handler.meta = new Map()

  const defineHelper: DefineHelper = {
    getProperty(type: any) {
      return handler.meta.get(type)
    },
    setProperty(type: any, value: any) {
      handler.meta.set(type, value)
    },
  }

  const operators = args as Operator<any>[]
  for (const operator of operators) {
    if (operator.defineMeta) {
      validateFunction(operator.defineMeta, 'operator.define')
      operator.defineMeta(defineHelper)
    }
  }

  return handler as any
}

const addUser = Pipe(
  Post(),
  Query<{ id: string }>(),
  Header<{ token: string }>(),
  async (name: string) => {
    return name
  }
)

addUser(
  {
    query: {
      id: '123',
    },
    header: {
      token: '456',
    },
  },
  '123'
)
