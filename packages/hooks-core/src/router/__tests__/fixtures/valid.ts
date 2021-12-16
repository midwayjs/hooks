import { Decorate, Get, Post, Query } from '../../../decorate'

export default Decorate(Get(), async () => {})

export const usePost = Decorate(Post(), async () => {})

export const withQuery = Decorate(
  Get(),
  Query<{ id: string }>(),
  async () => {}
)
