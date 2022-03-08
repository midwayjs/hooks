import { z } from 'zod'
import { validateFunction } from '../../'
import { Operator } from '../type'

/**
 * Validate input arguments.
 * Default lib is zod.
 */
export type Validator = (schemas: any[], input: any[]) => any | Promise<any>

let validator: Validator = (schemas: any, input: any[]) => {
  const tuple = z.tuple(schemas as any)
  return tuple.parseAsync(input)
}

export function setValidator(newValidator: Validator) {
  validateFunction(newValidator, 'newValidator')
  validator = newValidator
}

export function Validate(...schemas: any[]): Operator<void> {
  return {
    name: 'Validate',
    async execute({ getInputArguments }, next) {
      validateFunction(validator, 'validator')
      const inputs = getInputArguments()
      await validator(schemas, inputs)
      return next()
    },
  }
}
