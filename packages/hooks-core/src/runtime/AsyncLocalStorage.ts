import { ContextRuntime, HooksContext } from './type'
import { als } from '@midwayjs/asynchronous-local-storage'

export const AsyncLocalStorageRuntime: ContextRuntime = {
  name: 'AsyncLocalStorageRuntime',
  getValue(key: string) {
    return als.get<any>(key)
  },
  run(ctx: HooksContext, callback: () => Promise<any>) {
    return new Promise((resolve, reject) => {
      als.runWith(() => callback().then(resolve).catch(reject), ctx)
    })
  },
}
