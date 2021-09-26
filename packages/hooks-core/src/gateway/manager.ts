import { ProjectConfig, Route } from '../types'
import { Class, HooksGatewayAdapter } from '../types/gateway'
import { EventGateway } from './event'
import { HTTPGateway } from './http'

export class GatewayManager {
  private static instance: GatewayManager

  gateways: HooksGatewayAdapter[] = []

  constructor(root: string, projectConfig: ProjectConfig) {
    if (!GatewayManager.instance) {
      GatewayManager.instance = this

      this.gateways = [
        ...this.getBuiltInGateways(projectConfig),
        ...(projectConfig.gateway || []),
      ]?.map?.((Adapter) => new Adapter({ root, projectConfig }))
    }
    return GatewayManager.instance
  }

  private getBuiltInGateways(userConfig: ProjectConfig) {
    const builtinGateways = new Set<Class<HooksGatewayAdapter>>()
    for (const route of userConfig.routes) {
      if (route.basePath) builtinGateways.add(HTTPGateway)
      if (route.event) builtinGateways.add(EventGateway)
    }
    return [...builtinGateways]
  }

  getGatewayByRoute(route: Route) {
    const gateway = this.gateways.find((gateway) => gateway.is(route))

    if (!gateway) {
      throw new Error(
        `Can't find the correct gateway adapter, please check if midway.config.ts is correct`
      )
    }

    return gateway
  }
}

export function getGatewayManager(root: string, projectConfig: ProjectConfig) {
  return new GatewayManager(root, projectConfig)
}
