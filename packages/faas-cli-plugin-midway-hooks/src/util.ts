import createDebug from 'debug'
import { REGISTER_INSTANCE } from 'ts-node'

export const setupTsnode = () => {
  if (!process[REGISTER_INSTANCE]) {
    // During blitz interal dev, oclif automaticaly sets up ts-node so we have to check
    require('ts-node').register({
      compilerOptions: { module: 'commonjs' },
      transpileOnly: true,
    })
  }
  require('tsconfig-paths/register')
}

export const debug = createDebug('hooks: next-faas-cli-plugin')

export const argsPath = {
  http: 'ctx.request.body.args',
}
