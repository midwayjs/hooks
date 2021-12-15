import { inspect } from 'util'

export class ERR_INVALID_ARG_VALUE extends Error {
  constructor(actual: any, name: string, reason = 'is invalid') {
    const message = `[ERR_INVALID_ARG_VALUE]: The argument '${name}' ${reason} ${getTypeMessage(
      actual
    )}`
    super(message)
  }
}

export class ERR_INVALID_ARG_TYPE extends Error {
  constructor(name: string, expected: string, actual: any) {
    const message = `[ERR_INVALID_ARG_TYPE]: The '${name}' argument must be of type ${expected}${getTypeMessage(
      actual
    )}`
    super(message)
  }
}

// fork from https://github.com/nodejs/node/blob/master/lib/internal/errors.js
function getTypeMessage(actual: any) {
  let msg = ''
  if (actual == null) {
    msg += `. Received ${actual}`
  } else if (typeof actual === 'function' && actual.name) {
    msg += `. Received function ${actual.name}`
  } else if (typeof actual === 'object') {
    if (actual.constructor && actual.constructor.name) {
      msg += `. Received an instance of ${actual.constructor.name}`
    } else {
      const inspected = inspect(actual, { depth: -1 })
      msg += `. Received ${inspected}`
    }
  } else {
    let inspected = inspect(actual, { colors: false })
    if (inspected.length > 25) inspected = `${inspected.slice(0, 25)}...`
    msg += `. Received type ${typeof actual} (${inspected})`
  }
  return msg
}

export function validateArray(value: any, name: string) {
  if (!Array.isArray(value)) {
    throw new ERR_INVALID_ARG_TYPE(name, 'Array', value)
  }
}

export function validateString(value: any, name: string) {
  if (typeof value !== 'string')
    throw new ERR_INVALID_ARG_TYPE(name, 'string', value)
}

export function validateFunction(value: any, name: string) {
  if (typeof value !== 'function') {
    throw new ERR_INVALID_ARG_TYPE(name, 'Function', value)
  }
}

export function validateOneOf(value: any, name: string, oneOf: any[]) {
  if (!oneOf.includes(value)) {
    const allowed = oneOf
      .map((v) => (typeof v === 'string' ? `'${v}'` : String(v)))
      .join(', ')
    const reason = 'must be one of: ' + allowed
    throw new ERR_INVALID_ARG_VALUE(name, value, reason)
  }
}
