export const BuiltinHOC = ['withMiddleware']
export const BuiltinHooks = ['useContext', 'useInject', 'useConfig', 'useLogger', 'usePlugin']
export const FunctionHandler = 'handler'
export const MidwayHookContext = '$lambda'
export const HooksMethodNamespace = `${MidwayHookContext}.ctx.hooks`
export const ContextBind = `bind(${MidwayHookContext})`
export const DefaultKeyword = '$default'

export const LambdaMethodPrefix = '_'

export let MidwayHooksPackage = '@midwayjs/hooks'
export function setMidwayHooksPackage(pkg: string) {
  MidwayHooksPackage = pkg
}
