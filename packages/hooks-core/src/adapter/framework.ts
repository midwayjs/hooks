import { ResponseMetaData } from '../index'
import { AbstractRouter } from '../router/base'

export abstract class AbstractFrameworkAdapter {
  protected constructor(public router: AbstractRouter) {}
  abstract handleResponseMetaData(metadata: ResponseMetaData[]): Promise<any>
}

export let framework: AbstractFrameworkAdapter
