import {
  Api,
  Get,
  Headers,
  Middleware,
  Params,
  Query,
  useContext,
} from '../../../../../src'

export const withSlot = Api(
  Get(),
  Query<{ query: string }>(),
  Params<{ slot: string }>(),
  Headers<{ header: string }>(),
  Middleware(),
  async () => {
    const { query, params, header } = useContext()
    return { query, params, header }
  }
)
