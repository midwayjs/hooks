import {
  Api,
  Get,
  Headers,
  Params,
  Query,
  useContext,
} from '../../../../../src'

export const withSlot = Api(
  Get('/:slot/withSlot'),
  Query<{ query: string }>(),
  Params<{ slot: string }>(),
  Headers<{ header: string }>(),
  async () => {
    const { query, params, header } = useContext()
    return { query, params, header }
  }
)
