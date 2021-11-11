import { ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator'

import {
  createApiClientMatcher,
  createFunctionContainer,
  FileRouter,
  useApiClientMatcher,
} from '../../'
import { Route } from '../../types/config'
import {
  CreateApiOptions,
  GatewayAdapterOptions,
  HooksGatewayAdapter,
} from '../../types/gateway'

export class EventGateway implements HooksGatewayAdapter {
  private router: FileRouter
  private defaultApiClient = '@midwayjs/hooks-miniprogram-client'

  constructor(options: GatewayAdapterOptions) {
    this.router = new FileRouter(options)
    useApiClientMatcher(this.createEventClientMatcher())
  }

  is(route: Route) {
    return !!route?.event
  }

  createEventClientMatcher() {
    const userConfigClient = this.router.projectConfig?.request?.client
    const client =
      userConfigClient === '@midwayjs/hooks/request'
        ? this.defaultApiClient
        : userConfigClient

    return createApiClientMatcher().route(
      { event: 'wechat-miniprogram' },
      { client }
    )
  }

  createApi(options: CreateApiOptions) {
    const { functionId, fn, route } = options

    createFunctionContainer({
      fn,
      functionId,
      parseArgs(ctx, event) {
        let args: any[]
        switch (route.event) {
          case 'wechat-miniprogram':
            args = event?.args
        }
        return args || []
      },
      handlerDecorators: [
        ServerlessTrigger(ServerlessTriggerType.EVENT, {
          functionName: functionId,
        }),
      ],
    })
  }
}
