import { readDefaultTsConfig } from '@swc-node/register/read-default-tsconfig'
import { register as registerSWC } from '@swc-node/register/register'

export function register() {
  const options = readDefaultTsConfig()

  if (Array.isArray(options.files) && options.files.length) {
    options.files.push('midway.config.ts' as any)
  }

  registerSWC(options)

  if (options.paths && Object.keys(options.paths).length) {
    require('tsconfig-paths/register')
  }
}
