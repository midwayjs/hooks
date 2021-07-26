import { __decorate } from 'tslib'

import { IMidwayContainer } from '@midwayjs/core'
import { ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator'
import { Inject, Provide } from '@midwayjs/decorator'

import { FileRouter } from '../../../'
import { als } from '../../../runtime'
import { ServerRoute } from '../../../types/config'
import { CreateApiOptions, HooksGatewayAdapter } from '../../../types/gateway'
import { createEventApiClient } from './client'

export class EventGateway implements HooksGatewayAdapter {
  static is(route: ServerRoute) {
    return !!route?.event
  }

  static router = FileRouter
  static createApiClient = createEventApiClient

  container: IMidwayContainer

  createApi(options: CreateApiOptions) {
    const { functionId: id, fn, route } = options

    // Source: https://www.typescriptlang.org/play?noImplicitAny=false&strictNullChecks=false&strictFunctionTypes=false&strictPropertyInitialization=false&strictBindCallApply=false&noImplicitThis=false&noImplicitReturns=false&alwaysStrict=false&importHelpers=true&emitDecoratorMetadata=false&ts=4.1.5#code/MYewdgzgLgBAZmGBeGAKAdJghgJwOYQBcMWYAngNoC6AlMgHwwDeAvgFBsCWAtgA4g5YTNjBgAFHCABunACYBTADQiYASTAArecCjLRAZXk4pRgDbyIEACo5OePEb0xDxsxeu37Rq2V5K2LPCS3DAA5AAC3HIA7lhkGhAA9AqgOFhQAqEA3BzhEtJy8qg0bMCmWJYwAGIArmA6nOAAwuBQWJxgRswcouHqWjrFKjoAHsSkZD0w4S4mOOaWNnYOOKizboueKz5+6ACyVgDyYiWiFWT1MAAWpLLmq-ImYFDj5HTCoqJQV5wQ6KPoAR2DoAUSesBQ31+-ygI0BnlB4JgAB9kTBHvJnjlPjBQJBYHBgABBfAQZAwABS+kOADl0LxcBAihjnvTcFhuPIoEY-oSSQRTp88dASKTyXzSehcAQUWjqCpRDguTUcIgsLFOASwBhsKTBex2EA
    let FunctionContainer = class FunctionContainer {
      ctx: any
      async handler(event) {
        const args = getArgs(event, route)
        return await als.run({ ctx: this.ctx }, async () => await fn(...args))
      }
    }
    __decorate([Inject()], FunctionContainer.prototype, 'ctx', void 0)
    __decorate(
      [ServerlessTrigger(ServerlessTriggerType.EVENT, { functionName: id })],
      FunctionContainer.prototype,
      'handler',
      null
    )
    FunctionContainer = __decorate([Provide(id)], FunctionContainer)
    this.container.bind(id, FunctionContainer)
  }
}

function getArgs(event: any, route: ServerRoute) {
  let args: any[]
  switch (route.event) {
    case 'wechat-miniapp':
      args = event?.args
  }
  return args || []
}
