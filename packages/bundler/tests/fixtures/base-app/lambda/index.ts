import { Decorate, Get, Post, Query } from '@midwayjs/hooks-core'

export default Decorate(Get(), async () => {})

export const usePost = Decorate(Post(), async () => {})

export const withQuery = Decorate(
  Get(),
  Query<{ id: string }>(),
  async () => {}
)
