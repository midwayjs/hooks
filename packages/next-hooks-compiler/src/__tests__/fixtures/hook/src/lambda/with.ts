import { withMiddleware, useContext } from '@midwayjs/hooks'

export const hello = withMiddleware([], (name: string) => {
  const ctx = useContext()
  console.log(name)
})

declare module '@midwayjs/hooks' {
  export function withMiddleware(...args: any[]): any
}
