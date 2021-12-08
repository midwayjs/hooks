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
}

/**
 * @description route config
 */
export type Route = BaseRoute & HTTPRoute
