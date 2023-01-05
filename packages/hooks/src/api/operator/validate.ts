import type { Schema, z as Zod } from 'zod'
import { HttpStatus, MidwayHttpError, registerErrorCode } from '@midwayjs/core'
import { Operator, setValidator } from '@midwayjs/hooks-core'
import { useContext } from '../hooks'

const HooksValidateErrorCode = registerErrorCode('Validation', {
  FAILED: 'FAILED',
})

export class HooksValidationError extends MidwayHttpError {
  constructor(message: string, status: number, cause: any) {
    super(message, status, HooksValidateErrorCode.FAILED, { cause })
  }
}

export { Validate } from '@midwayjs/hooks-core'

function getZod(): typeof Zod {
  try {
    return require('zod').z
  } catch (e) {
    throw new Error(`Package zod is required for Validation`, { cause: e })
  }
}

setValidator(async (schemas: any, inputs: any[]) => {
  const z = getZod()
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
  query?: Schema<any>
  data?: Schema<any>[]
  params?: Schema<any>
  headers?: Schema<any>
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
          const z = getZod()
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
