import { HooksMiddleware } from './common'
import { HooksGatewayAdapterStatic } from './gateway'

export type IgnorePattern = (req: {
  url: string
  [key: string]: any
}) => boolean

/**
 * @internal
 */
export interface ProjectConfig {
  gateway?: HooksGatewayAdapterStatic[]
  /**
   * @description server root, default is src/apis
   */
  source?: string
  /**
   * @description api routes directory
   * @example [{ baseDir: 'lambda', baseRoute: '/api' }]
   */
  routes: Route[]
  /**
   * @description customize the request client
   */
  request?: {
    /**
     * @description midway hooks request client(npm package)
     * @example axios
     */
    client?: string
  }

  /**
   * @description customize dev server
   */
  dev?: {
    /**
     * @description If the function returns true, the server will ignore the request
     */
    ignorePattern?: IgnorePattern
  }
  /**
   * @description customize project build config
   */
  build?: {
    viteOutDir: string
    outDir: string
  }
}

export type RuntimeConfig = {
  /**
   * @description global middleware, only available in http mode
   */
  middleware?: HooksMiddleware
}

export type BaseRoute = {
  /**
   * @description api route directory, exported functions in the directory will create a api
   */
  baseDir: string
  [key: string]: any
}

export type HTTPRoute = {
  /**
   * @description http api prefix
   * @example /api
   */
  basePath: string
  /**
   * @deprecated will be removed in next major version.
   */
  underscore?: boolean
}

export type EventRoute = {
  /**
   * @description event type
   * @example wechat-miniprogram
   */
  event?: 'wechat-miniprogram'
}

export type MTOPRoute = {
  mtop?: boolean
}

export type HSFRoute = {
  hsf?: boolean
}

/**
 * @description route config
 */
export type Route = BaseRoute & (HTTPRoute | EventRoute | MTOPRoute | HSFRoute)
/**
 * @deprecated ServerRoute now rename to Route
 */
export type ServerRoute = Route

export interface UserConfig extends Omit<ProjectConfig, 'build'> {}
