import { isTypeScriptEnvironment } from '@midwayjs/bootstrap'

export function isProduction() {
  return !isTypeScriptEnvironment()
}

export function isTest() {
  return process.env.NODE_ENV === 'test'
}
