import {
  IMidwayContainer,
  IMidwayBaseApplication,
  Context,
} from '@midwayjs/core'
import {
  ComponentOptions,
  CreateApiOptions,
  HooksGatewayAdapter,
  ServerRoute,
} from '@midwayjs/hooks-core'

export type CustomRoute = {
  custom: boolean
}

export class CustomGateway implements HooksGatewayAdapter {
  options: ComponentOptions
  container: IMidwayContainer
  app: IMidwayBaseApplication<Context>

  createApi(options: CreateApiOptions): void {
    this.container.bind('custom', options.fn)
  }

  afterCreate(): void {}

  static is(route: ServerRoute): boolean {
    return !!route?.custom
  }

  static router = null
  static createApiClient = null
}
