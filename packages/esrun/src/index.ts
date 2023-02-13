import { readDefaultTsConfig } from '@swc-node/register/read-default-tsconfig'
import { register as registerSWC } from '@swc-node/register/register'

export function register() {
  const options = readDefaultTsConfig()

  // ensure all files are compiled
  options.files = null
  // transpile to CommonJS by Default
  options.module = 'CommonJS' as any

  registerSWC(options)

  if (options.paths && Object.keys(options.paths).length) {
    require('tsconfig-paths/register')
  }
}
