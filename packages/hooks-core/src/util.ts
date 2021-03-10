import { isTypeScriptEnvironment } from '@midwayjs/bootstrap'

export function isProduction() {
  if (isTypeScriptEnvironment()) {
    return false
  }

  if (
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development'
  ) {
    return false
  }

  return true
}
