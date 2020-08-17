export const MidwayDecoratorPackage = '@midwayjs/decorator'
export const BuiltinHooks = ['useContext', 'useInject', 'useConfig', 'useLogger', 'usePlugin']
export const FunctionHandler = 'handler'
export const MidwayHookDecorator = 'MidwayHooks'
export const MidwayHookContext = '$lambda'
export const HooksMethodNamespace = `${MidwayHookContext}.ctx.hooks`
export const MidwayInstanceMethod = `${MidwayHookContext}.ctx.requestContext.get`
export const MidwayHookApiDirectory = 'lambda'
export const FuncHandlerSuffix = 'handler'
export const ContextBind = `bind(${MidwayHookContext})`
export const LambdaProxy = 'LambdaProxy'
export const DefaultKeyword = '$default'

export const LambdaMethodPrefix = '_'

export const enum LambdaGatewayType {
  HTTP = 'HTTP',
}

export let MidwayHooksPackage = '@midwayjs/hooks'
export function setMidwayHooksPackage(pkg: string) {
  MidwayHooksPackage = pkg
}
