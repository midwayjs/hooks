import { Api, Get, Post, Query } from '../../../api'

export default Api(Get(), async () => {})

export const usePost = Api(Post(), async () => {})

export const withQuery = Api(Get(), Query<{ id: string }>(), async () => {})
