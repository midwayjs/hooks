import { ApiRoute, loadApiRoutes, ResponseMetaData } from '../index'
import { AbstractRouter } from '../router/base'

export abstract class AbstractFrameworkAdapter {
  protected constructor(public router: AbstractRouter) {}

  abstract registerApiRoutes(apis: ApiRoute[]): Promise<any>
  abstract handleResponseMetaData(metadata: ResponseMetaData[]): Promise<any>
}

export let framework: AbstractFrameworkAdapter
export async function createApplication(
  source: string,
  frameworkAdapter: AbstractFrameworkAdapter
) {
  framework = frameworkAdapter
  const apis = loadApiRoutes(source, framework.router)

  if (apis.length === 0) {
    console.warn('No api routes found, source is:', source)
  }

  await framework.registerApiRoutes(apis)
}
