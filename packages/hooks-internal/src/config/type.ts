import type { HooksMiddleware, Route } from '@midwayjs/hooks-core'

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
   * @description add fallback behavior for @midwayjs/hooks v2
   * @default false
   */
  legacy?: boolean

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
