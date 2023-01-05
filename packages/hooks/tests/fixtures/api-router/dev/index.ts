import { Api, Get, useContext } from '../../../../src'

export const get = Api(Get('/dev_only'), async () => {
  const ctx = useContext()
  return ctx.path
})
