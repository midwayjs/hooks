import { z } from 'zod'
import { HttpStatus, MidwayHttpError, registerErrorCode } from '@midwayjs/core'
import { Operator, setValidator, useContext } from '@midwayjs/hooks-core'

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

type ValidateHttpOption = {
  query?: z.Schema<any>
  data?: z.Schema<any>[]
  params?: z.Schema<any>
  headers?: z.Schema<any>
}

export function ValidateHttp(option: ValidateHttpOption): Operator<void> {
  return {
    name: 'ValidateHttp',
    async execute({ next, getInputArguments }) {
      const ctx = useContext()

      try {
        if (option.query) await option.query.parseAsync(ctx.query)
        if (option.params) await option.params.parseAsync(ctx.params)
        if (option.headers) await option.headers.parseAsync(ctx.headers)

        if (option.data) {
          const inputs = getInputArguments()
          for (let i = 0; i < option.data.length; i++) {
            const schema = option.data[i]
            const input = inputs[i]
            await schema.parseAsync(input)
          }
        }
      } catch (error) {
        throw new HooksValidationError(
          error.message,
          HttpStatus.UNPROCESSABLE_ENTITY,
          error
        )
      }

      return next()
    },
  }
}
