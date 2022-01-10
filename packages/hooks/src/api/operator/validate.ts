import { z } from 'zod'
import { HttpStatus, MidwayHttpError, registerErrorCode } from '@midwayjs/core'
import { setValidator } from '@midwayjs/hooks-core'

const HooksValidateErrorCode = registerErrorCode('HOOKS_VALIDATE', {
  VALIDATE_FAIL: 10000,
})

class HooksValidationError extends MidwayHttpError {
  constructor(message: string, status: number, cause: any) {
    super(message, status, HooksValidateErrorCode.VALIDATE_FAIL, { cause })
  }
}

export { Validate } from '@midwayjs/hooks-core'

setValidator(async (schema: z.Schema<any>, input: any) => {
  const result = await schema.safeParseAsync(input)
  if (result.success === false) {
    throw new HooksValidationError(
      result.error.message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      result.error
    )
  }
})
