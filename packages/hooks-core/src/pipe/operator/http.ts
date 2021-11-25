import { Operator, OperatorType } from '../type'

export const HttpTrigger = 'HTTP'

export enum HttpProperty {
  METHOD = 'METHOD',
  QUERY = 'QUERY',
  PARAM = 'PARAM',
  HEADER = 'HEADER',
}

function createHTTPMethodOperator(method: string) {
  return () => {
    return {
      name: method,
      defineMeta({ setProperty }) {
        setProperty(OperatorType.Trigger, {
          type: HttpTrigger,
          method,
        })
      },
    } as Operator<void>
  }
}

// HTTP Method
export const All = createHTTPMethodOperator('ALL')
export const Get = createHTTPMethodOperator('GET')
export const Post = createHTTPMethodOperator('POST')
export const Put = createHTTPMethodOperator('PUT')
export const Del = createHTTPMethodOperator('DELETE')
export const Patch = createHTTPMethodOperator('PATCH')
export const Head = createHTTPMethodOperator('HEAD')
export const Options = createHTTPMethodOperator('OPTIONS')

// HTTP Helper
export function Query<T extends Record<string, string>>(): Operator<{
  query: T
}> {
  return {
    name: HttpProperty.QUERY,
    requireInput: true,
    defineMeta({ setProperty }) {
      setProperty(HttpProperty.QUERY, true)
    },
  }
}

export function Param<T extends Record<string, string>>(): Operator<{
  param: T
}> {
  return {
    name: HttpProperty.PARAM,
    requireInput: true,
    defineMeta({ setProperty }) {
      setProperty(HttpProperty.PARAM, true)
    },
  }
}

export function Header<T extends Record<string, string>>(): Operator<{
  header: T
}> {
  return {
    name: HttpProperty.HEADER,
    requireInput: true,
    defineMeta({ setProperty }) {
      setProperty(HttpProperty.HEADER, true)
    },
  }
}
