export type HooksContext = {
  ctx: any
}

export interface ContextRuntime {
  name: string
  getValue(key: string): any
  run(ctx: HooksContext, callback: () => Promise<any>): Promise<any>
}
