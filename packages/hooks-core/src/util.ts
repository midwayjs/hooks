import { isTypeScriptEnvironment } from '@midwayjs/bootstrap'

export function isProduction() {
  return !isTypeScriptEnvironment()
}
