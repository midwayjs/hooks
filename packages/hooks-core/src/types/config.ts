import { HooksMiddleware } from './common'

export interface InternalConfig {
  /**
   * @default false
   * Enable superjson to serialize Set/Map/Error/BigInt, default is false
   */
  superjson?: boolean
  source?: string
  routes: ServerRoute[]
  request?: {
    client?: string
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
}

export type ServerRoute = {
  baseDir: string
  basePath: string
}

export interface UserConfig extends Omit<InternalConfig, 'build' | 'request'> {}
