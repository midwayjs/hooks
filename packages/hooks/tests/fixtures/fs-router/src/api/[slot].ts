import {
  Api,
  Get,
  Header,
  Middleware,
  Params,
  Query,
  useContext,
} from '../../../../../src'

export const withSlot = Api(
  Get(),
  Query<{ query: string }>(),
  Params<{ slot: string }>(),
  Header<{ header: string }>(),
  Middleware(),
  async () => {
    const { query, params, header } = useContext()
    return { query, params, header }
  }
)
