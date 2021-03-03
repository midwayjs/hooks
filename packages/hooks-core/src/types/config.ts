export interface InternalConfig {
  source?: string
  routes: ServerRoute[]
  build?: {
    outDir: string
  }
}

export type ServerRoute = {
  baseDir: string
  basePath: string
}

export interface UserConfig extends Omit<InternalConfig, 'source' | 'build'> {
  [key: string]: any
}
