import { HooksMiddleware } from './common'
import { Class, HooksGatewayAdapter } from './gateway'

export type IgnorePatternRequest = { url: string; [key: string]: any }

export interface InternalConfig<T = HTTPRoute> {
  /**
   * @default false
   * @deprecated will be removed in next version.
   * Enable superjson to serialize Set/Map/Error/BigInt, default is false
   */
  superjson?: boolean
  source?: string
  routes: ServerRoute<T>[]
  request?: {
    client?: string
  }

  dev?: {
    ignorePattern?: (req: IgnorePatternRequest) => boolean
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
   * @deprecated will be removed in next major version.
   */
  underscore?: boolean
}

export type ServerRoute<T = HTTPRoute> = BaseRoute & Partial<T>

export interface UserConfig<T = HTTPRoute>
  extends Omit<InternalConfig<T>, 'build'> {}
