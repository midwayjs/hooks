import {
  Decorate,
  Get,
  Header,
  Param,
  Query,
  useContext,
} from '../../../../../src'

export const withSlot = Decorate(
  Get('/:slot/withSlot'),
  Query<{ query: string }>(),
  Param<{ slot: string }>(),
  Header<{ header: string }>(),
  async () => {
    const { query, params, header } = useContext()
    return { query, params, header }
  }
)
