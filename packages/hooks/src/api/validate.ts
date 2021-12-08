import { z } from 'zod'
import { MidwayValidationError } from '@midwayjs/core'
import { setValidator } from '@midwayjs/hooks-core'

export { Validate } from '@midwayjs/hooks-core'

setValidator((schema: z.Schema<any>, input: any) => {
  const result = schema.safeParse(input)
  if (result.success === false) {
    throw new MidwayValidationError(result.error.message, 422, result.error)
  }
})
