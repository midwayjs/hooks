import { HooksMiddleware } from './common'

export interface InternalConfig {
  source?: string
  routes: ServerRoute[]
  build?: {
    viteOutDir: string
    outDir: string
  }
}

export type ComponentConfig = {
  /**
   * Global middleware
   */
  middleware?: HooksMiddleware
}

export type ServerRoute = {
  baseDir: string
  basePath: string
}

export interface UserConfig extends Omit<InternalConfig, 'build'> {}
