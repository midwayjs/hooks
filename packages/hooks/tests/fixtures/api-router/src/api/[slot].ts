import { Api, Get, Header, Params, Query, useContext } from '../../../../../src'

export const withSlot = Api(
  Get('/:slot/withSlot'),
  Query<{ query: string }>(),
  Params<{ slot: string }>(),
  Header<{ header: string }>(),
  async () => {
    const { query, params, header } = useContext()
    return { query, params, header }
  }
)
