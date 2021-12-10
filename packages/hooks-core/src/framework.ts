import { ApiRoute, loadApiRoutes, ResponseMetaData, Route } from '.'

export type FrameworkConfig = {
  root: string
  source: string
  routes: Route[]
}

export abstract class HooksFramework {
  private static framework: HooksFramework

  static getFramework() {
    return this.framework
  }

  protected constructor(public config: FrameworkConfig) {
    HooksFramework.framework = this
  }

  async init() {
    const apis = loadApiRoutes(this.config)
    await this.handleApiRoutes(apis)
  }

  abstract handleApiRoutes(apis: ApiRoute[]): Promise<any>
  abstract handleResponseMetaData(metadata: ResponseMetaData[]): Promise<any>
}
