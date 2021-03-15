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
  middleware?: any[]
}

export type ServerRoute = {
  baseDir: string
  basePath: string
}

export interface UserConfig extends Omit<InternalConfig, 'build'> {}
