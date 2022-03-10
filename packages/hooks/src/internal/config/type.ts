import type { HooksMiddleware, Route } from '@midwayjs/hooks-core'

export type IgnorePattern = (req: {
  url: string
  [key: string]: any
}) => boolean

type HTTPRoute = {
  /**
   * @description http api prefix
   * @example /api
   */
  basePath: string
}

export type MidwayRoute = Route & HTTPRoute

/**
 * @internal
 */
export interface ProjectConfig {
  /**
   * @description server root, default is src/api
   */
  source?: string
  /**
   * @description api routes directory
   * @example [{ baseDir: 'lambda', basePath: '/api' }]
   */
  routes?: MidwayRoute[]
  /**
   * @description customize the request client
   */
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
    outDir: string
  }
}

export type RuntimeConfig = {
  /**
   * @description global middleware, only available in http mode
   */
  middleware?: HooksMiddleware[] | any[]
}

/**
 * @description user define config
 */
export interface UserConfig extends ProjectConfig {}
