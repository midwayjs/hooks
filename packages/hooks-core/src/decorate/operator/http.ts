import { DefineHelper, Operator, OperatorType } from '../type'

export const HttpTrigger = 'HTTP'

export enum HttpProperty {
  METHOD = 'Http_Method',
  QUERY = 'Http_Query',
  PARAM = 'Http_Param',
  HEADER = 'Http_Header',
  RESPONSE = 'Http_Response',
}

export enum ResponseMetaType {
  CODE = 'Http_Response_Code',
  HEADER = 'Http_Response_Header',
  CONTENT_TYPE = 'Http_Response_ContentType',
  REDIRCT = 'Http_Response_Redirect',
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

export type ResponseMetaData = {
  type: ResponseMetaType
  code?: number
  header?: {
    key: string
    value: string
  }
  url?: string
  contentType?: string
}

export function HttpCode(code: number): Operator<void> {
  return {
    name: 'HttpCode',
    defineMeta(helper) {
      setResponseMetaData(helper, ResponseMetaType.CODE, { code })
    },
  }
}

export function SetHeader(key: string, value: string): Operator<void> {
  return {
    name: 'SetHeader',
    defineMeta(helper) {
      setResponseMetaData(helper, ResponseMetaType.HEADER, {
        header: {
          key,
          value,
        },
      })
    },
  }
}

export function Redirect(url: string, code?: number): Operator<void> {
  return {
    name: 'Redirect',
    defineMeta(helper) {
      setResponseMetaData(helper, ResponseMetaType.REDIRCT, {
        url,
        code,
      })
    },
  }
}

export function ContentType(contentType: string): Operator<void> {
  return {
    name: 'ContentType',
    defineMeta(helper) {
      setResponseMetaData(helper, ResponseMetaType.CONTENT_TYPE, {
        contentType,
      })
    },
  }
}

function setResponseMetaData(
  helper: DefineHelper,
  type: ResponseMetaType,
  value: Partial<ResponseMetaData>
) {
  const responseMetaData: ResponseMetaData[] =
    helper.getProperty(HttpProperty.RESPONSE) || []
  helper.setProperty(HttpProperty.RESPONSE, [
    ...responseMetaData,
    {
      type,
      ...value,
    },
  ])
}
