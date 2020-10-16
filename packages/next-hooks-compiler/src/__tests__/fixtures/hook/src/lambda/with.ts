import { withMiddleware, useContext } from '@midwayjs/hooks'

export const post = withMiddleware([], (name: string) => {
  const ctx = useContext()
  console.log(name)
})

export const get = withMiddleware([], () => {
  const ctx = useContext()
  console.log(name)
})

declare module '@midwayjs/hooks' {
  export function withMiddleware(...args: any[]): any
}
