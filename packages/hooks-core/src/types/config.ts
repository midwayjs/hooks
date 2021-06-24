import { HooksMiddleware } from './common'
import { Class, HooksGatewayAdapter } from './gateway'

export interface InternalConfig<T = HTTPRoute> {
  /**
   * @default false
   * Enable superjson to serialize Set/Map/Error/BigInt, default is false
   */
  superjson?: boolean
  source?: string
  routes: ServerRoute<T>[]
  request?: {
    client?: string
  }

  dev?: {
    ignorePattern?: (req: { url: string; [key: string]: any }) => boolean
  }
  build?: {
    viteOutDir: string
    outDir: string
  }
}

export type RuntimeConfig = {
  /**
   * Global middleware
   */
  middleware?: HooksMiddleware

  gatewayAdapter?: Class<HooksGatewayAdapter>[]
}

export type BaseRoute = {
  baseDir: string
}

export type HTTPRoute = {
  basePath: string
  /**
   * @deprecated Will remove in next
   */
  underscore?: boolean
}

export type ServerRoute<T = HTTPRoute> = BaseRoute & T

export interface UserConfig<T = HTTPRoute>
  extends Omit<InternalConfig<T>, 'build'> {}
