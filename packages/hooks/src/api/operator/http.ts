import { Operator, useContext } from '@midwayjs/hooks-core'

export function HttpCode(code: number): Operator<void> {
  return {
    name: 'HttpCode',
    async execute({ next }) {
      await next()
      const ctx = useContext()
      ctx.status = code
    },
  }
}

export function SetHeader(name: string, value: string): Operator<void> {
  return {
    name: 'SetHeader',
    async execute({ next }) {
      await next()
      const ctx = useContext()
      ctx.set(name, value)
    },
  }
}

export function Redirect(url: string, code?: number): Operator<void> {
  return {
    name: 'Redirect',
    async execute({ next }) {
      await next()
      const ctx = useContext()
      if (code) {
        ctx.status = code
      }
      ctx.redirect(url)
    },
  }
}

export function ContentType(contentType: string): Operator<void> {
  return {
    name: 'ContentType',
    async execute({ next }) {
      await next()
      const ctx = useContext()
      ctx.type = contentType
    },
  }
}
