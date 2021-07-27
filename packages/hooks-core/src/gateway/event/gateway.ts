import { __decorate } from 'tslib'

import { IMidwayContainer } from '@midwayjs/core'
import { ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator'

import { createFunctionContainer, FileRouter } from '../../'
import { Route } from '../../types/config'
import { CreateApiOptions, HooksGatewayAdapter } from '../../types/gateway'
import { createEventApiClient } from './client'

export class EventGateway implements HooksGatewayAdapter {
  static is(route: Route) {
    return !!route?.event
  }

  static router = FileRouter
  static createApiClient = createEventApiClient

  container: IMidwayContainer

  createApi(options: CreateApiOptions) {
    const { functionId, fn, route } = options

    const FunctionContainer = createFunctionContainer({
      fn,
      functionId,
      parseArgs(_, event) {
        let args: any[]
        switch (route.event) {
          case 'wechat-miniapp':
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

    this.container.bind(functionId, FunctionContainer)
  }
}
