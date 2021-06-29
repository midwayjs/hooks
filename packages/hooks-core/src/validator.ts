class ERR_INVALID_ARG_VALUE extends Error {
  constructor(value: any, name: string) {
    const message = `[ERR_INVALID_ARG_VALUE]: The argument '${name}' is invalid. Received ${typeof value}`
    super(message)
  }
}

class ERR_INVALID_ARG_TYPE extends Error {
  constructor(name: string, expected: string, actual: any) {
    const message = `[ERR_INVALID_ARG_TYPE]: The '${name}' argument must be of type ${expected}. Received an instance of ${typeof actual}`
    super(message)
  }
}

export function validateArray(value: any, name: string) {
  if (!Array.isArray(value)) {
    throw new ERR_INVALID_ARG_TYPE(value, 'Array', name)
  }
}
