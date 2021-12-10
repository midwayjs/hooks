import { ApiRoute, loadApiRoutes, LoadConfig, ResponseMetaData } from '.'

export interface FrameworkConfig extends LoadConfig {}

export abstract class AbstractFrameworkAdapter {
  protected constructor(public config: FrameworkConfig) {}

  async init() {
    const apis = loadApiRoutes(this.config)
    await this.handleApiRoutes(apis)
  }

  abstract handleApiRoutes(apis: ApiRoute[]): Promise<any>
  abstract handleResponseMetaData(metadata: ResponseMetaData[]): Promise<any>
}

export let adapter: AbstractFrameworkAdapter
export async function createApplication(
  frameworkAdapter: AbstractFrameworkAdapter
) {
  adapter = frameworkAdapter
  await adapter.init()
}
