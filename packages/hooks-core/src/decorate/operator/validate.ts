import { z } from 'zod'

import { validateFunction } from '../../'
import { Operator } from '../type'

/**
 * Validate input arguments.
 * Default lib is zod.
 */
export type Validator = (schema: any, input: any) => any | Promise<any>

let validator: Validator = (schema: z.Schema<any>, input: any) =>
  schema.parseAsync(input)

export function setValidator(newValidator: Validator) {
  validateFunction(newValidator, 'newValidator')
  validator = newValidator
}

export function Validate(...schemas: any[]): Operator<void> {
  return {
    name: 'Validate',
    async execute({ next, getInputArguments }) {
      const inputs = getInputArguments()

      // validate args using valdiators
      for (let i = 0; i < schemas.length; i++) {
        const schema = schemas[i]
        const input = inputs[i]

        validateFunction(validator, 'validator')
        await validator(schema, input)
      }

      return next()
    },
  }
}
