import { EnhancedFunc } from '../types/common'

const DefaultKeyword = '$default'

export function proxy(
  handleApply: (func: EnhancedFunc, thisArg: any, args: any[]) => any
): any {
  const handler: ProxyHandler<EnhancedFunc> = {
    get(target, prop: string) {
      if (target._param && target._param.meta.name !== DefaultKeyword) {
        // TODO 对于 a.b.c 的调用报错
        throw new Error('Only call lambda(api function) from top level')
      }

      const func: EnhancedFunc = async () => {}
      func._param = {
        meta: { name: prop },
      }

      return new Proxy(func, handler)
    },
    apply(target, thisArg, args: any[]) {
      if (!target._param?.meta?.name) {
        target._param = {
          meta: { name: DefaultKeyword },
        }
      }

      return handleApply(target, thisArg, args)
    },
  }

  return new Proxy(() => {}, handler)
}
