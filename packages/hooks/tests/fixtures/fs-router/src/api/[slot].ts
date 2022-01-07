import {
  Api,
  Get,
  Header,
  Middleware,
  Param,
  Query,
  useContext,
} from '../../../../../src'

export const withSlot = Api(
  Get(),
  Query<{ query: string }>(),
  Param<{ slot: string }>(),
  Header<{ header: string }>(),
  Middleware(),
  async () => {
    const { query, params, header } = useContext()
    return { query, params, header }
  }
)
