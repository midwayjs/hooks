export const BuiltinHOC = ['withController']
export const BuiltinHooks = ['useContext', 'useInject', 'useConfig', 'useLogger', 'usePlugin']
export const FunctionHandler = 'handler'
export const HooksRequestContext = '_req_ctx_'
export const HooksMethodNamespace = `${HooksRequestContext}.ctx.hooks`
export const ContextBind = `bind(${HooksRequestContext})`
export const DefaultKeyword = '$default'

export const LambdaMethodPrefix = '_'

export let MidwayHooksPackage = '@midwayjs/hooks'
export function setMidwayHooksPackage(pkg: string) {
  MidwayHooksPackage = pkg
}
