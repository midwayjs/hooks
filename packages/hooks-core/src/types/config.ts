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
  /**
   * @deprecated will be removed in next version.
   * Enable superjson to serialize Set/Map/Error/BigInt, default is false
   */
  superjson?: boolean
  gateway?: HooksGatewayAdapterStatic[]
  /**
   * @description server root, default is src/apis
   */
  source?: string
  /**
   * @description api routes directory
   * @example [{ baseDir: 'lambda', baseRoute: '/api' }]
   */
  routes: ServerRoute[]
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
   * @description global middleware, only avaible in http mode
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
   * @example wechat-miniapp
   */
  event?: 'wechat-miniapp'
}

/**
 * @description route config
 */
export type ServerRoute = BaseRoute & (HTTPRoute | EventRoute)

export interface UserConfig extends Omit<ProjectConfig, 'build'> {}
