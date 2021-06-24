import {
  IMidwayContainer,
  IMidwayBaseApplication,
  Context,
} from '@midwayjs/core'
import {
  ComponentConfig,
  CreateApiParam,
  HooksGatewayAdapter,
  ServerRoute,
} from '@midwayjs/hooks-core'

export type CustomRoute = {
  custom: boolean
}

export class CustomGateway implements HooksGatewayAdapter {
  config: ComponentConfig
  container: IMidwayContainer
  app: IMidwayBaseApplication<Context>

  createApi(config: CreateApiParam): void {
    this.container.bind('custom', config.fn)
  }

  afterCreate(): void {}

  is(route: ServerRoute<CustomRoute>): boolean {
    return !!route?.custom
  }
}
