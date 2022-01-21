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

export function ValidateHttp(options: ValidateHttpOption): Operator<void> {
  return {
    name: 'ValidateHttp',
    async execute({ getInputArguments }, next) {
      const ctx = useContext()

      try {
        if (options.params) await options.params.parseAsync(ctx.params)
        if (options.query) await options.query.parseAsync(ctx.query)
        if (options.headers) await options.headers.parseAsync(ctx.headers)
        if (options.data) {
          const inputs = getInputArguments()
          for (let i = 0; i < options.data.length; i++) {
            const schema = options.data[i]
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
