import createDebug from 'debug'

export const debug = createDebug('hooks: next-faas-cli-plugin')

export const argsPath = {
  http: 'ctx.request.body.args',
}
