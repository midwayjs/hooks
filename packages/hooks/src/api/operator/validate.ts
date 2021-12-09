import { z } from 'zod'
import { MidwayValidationError } from '@midwayjs/core'
import { setValidator } from '@midwayjs/hooks-core'

export { Validate } from '@midwayjs/hooks-core'

setValidator(async (schema: z.Schema<any>, input: any) => {
  const result = await schema.safeParseAsync(input)
  if (result.success === false) {
    throw new MidwayValidationError(result.error.message, 422, result.error)
  }
})
