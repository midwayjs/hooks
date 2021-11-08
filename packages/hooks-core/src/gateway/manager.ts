import { ProjectConfig, Route } from '../types'
import { Class, HooksGatewayAdapter } from '../types/gateway'
import { EventGateway } from './event'
import { HTTPGateway } from './http'

export class GatewayManager {
  private static instance: GatewayManager

  static getInstance(
    root: string,
    projectConfig: ProjectConfig,
    useSourceFile?: boolean
  ) {
    GatewayManager.instance ??= new GatewayManager(
      root,
      projectConfig,
      useSourceFile
    )
    return GatewayManager.instance
  }

  gateways: HooksGatewayAdapter[] = []

  private constructor(
    root: string,
    projectConfig: ProjectConfig,
    useSourceFile: boolean
  ) {
    this.gateways = this.getBuiltInGateways(projectConfig)
      .concat(projectConfig.gateway)
      .map((Adapter) => new Adapter({ root, projectConfig, useSourceFile }))
  }

  private getBuiltInGateways(userConfig: ProjectConfig) {
    const builtinGateways = new Set<Class<HooksGatewayAdapter>>()
    for (const route of userConfig.routes) {
      if (route.basePath) builtinGateways.add(HTTPGateway)
      if (route.event) builtinGateways.add(EventGateway)
    }
    return Array.from(builtinGateways)
  }

  getGatewayByRoute(route: Route) {
    const gateway = this.gateways.find((gateway) => gateway.is(route))

    if (!gateway) {
      throw new Error(
        `Can't find the correct gateway adapter. Current route: ${route}`
      )
    }

    return gateway
  }
}
