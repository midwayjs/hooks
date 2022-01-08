import { ResponseMetaData } from '../index'
import { AbstractRouter } from '../router/base'

export abstract class AbstractFrameworkAdapter {
  public static instance: AbstractFrameworkAdapter = null
  protected constructor(public router: AbstractRouter) {
    AbstractFrameworkAdapter.instance = this
  }
  abstract handleResponseMetaData(metadata: ResponseMetaData[]): Promise<any>
}
