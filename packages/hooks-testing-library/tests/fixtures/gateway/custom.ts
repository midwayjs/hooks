import { IMidwayContainer } from '@midwayjs/core'
import {
  CreateApiOptions,
  HooksGatewayAdapter,
  Route,
} from '@midwayjs/hooks-core'

export type CustomRoute = {
  custom: boolean
}

export let isCustomGatewayExecute = false

export class CustomGateway implements HooksGatewayAdapter {
  container: IMidwayContainer

  createApi(options: CreateApiOptions): void {
    isCustomGatewayExecute = true
  }

  is(route: Route): boolean {
    return !!route?.custom
  }
}
