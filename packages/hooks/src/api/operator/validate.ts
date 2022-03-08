import { z } from 'zod'
import { HttpStatus, MidwayHttpError, registerErrorCode } from '@midwayjs/core'
import { Operator, setValidator, useContext } from '@midwayjs/hooks-core'

const HooksValidateErrorCode = registerErrorCode('Validation', {
  FAILED: 'FAILED',
})

class HooksValidationError extends MidwayHttpError {
  constructor(message: string, status: number, cause: any) {
    super(message, status, HooksValidateErrorCode.FAILED, { cause })
  }
}

export { Validate } from '@midwayjs/hooks-core'

setValidator(async (schemas: any, inputs: any[]) => {
  const result = await z.tuple(schemas).safeParseAsync(inputs)

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
          const tuple = z.tuple(options.data as any)
          await tuple.parseAsync(inputs)
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
