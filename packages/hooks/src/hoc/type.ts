export type EnhancedFunc = {
  (...args: any[]): Promise<any>
  middleware?: any[]
}
