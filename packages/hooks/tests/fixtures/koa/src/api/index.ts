import { z } from 'zod'

import {
  Decorate,
  Del,
  Get,
  Post,
  useContext,
  Validate,
} from '../../../../../src'

export const hello = () => {
  return 'Hello World!'
}

export const get = Decorate(Get(), async () => {
  const ctx = useContext()
  return ctx.path
})

export const post = Decorate(
  Post(),
  Validate(z.string()),
  async (input: string) => {
    const ctx = useContext()
    return {
      path: ctx.path,
      input,
    }
  }
)
