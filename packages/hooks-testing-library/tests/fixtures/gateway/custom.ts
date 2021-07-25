import {
  IMidwayContainer,
  IMidwayBaseApplication,
  Context,
} from '@midwayjs/core'
import {
  ComponentOptions,
  CreateApiParam,
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

  createApi(config: CreateApiParam): void {
    this.container.bind('custom', config.fn)
  }

  afterCreate(): void {}

  is(route: ServerRoute): boolean {
    return !!route?.custom
  }
}
