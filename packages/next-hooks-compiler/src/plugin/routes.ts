import { GatewayConfig } from './gateway/interface'
import type { FunctionStructure } from '@midwayjs/serverless-spec-builder'
import type { Dictionary } from 'lodash'

type SourceFilePath = string

const map = new Map<SourceFilePath, MidwayHooksFunctionStructure[]>()

export function addRoute(sourceFilePath: SourceFilePath, gateway: MidwayHooksFunctionStructure) {
  if (!map.has(sourceFilePath)) {
    map.set(sourceFilePath, [])
  }

  const routes = map.get(sourceFilePath)

  const idx = routes.findIndex((config) => config.handler === gateway.handler)
  if (idx !== -1) {
    routes.splice(idx, 1)
  }

  routes.push(gateway)
}

export function getRoutes(sourceFilePath: SourceFilePath) {
  return map.get(sourceFilePath) ?? []
}

export function clearRoutes() {
  map.clear()
}

export function getFunctionsMeta(): Dictionary<MidwayHooksFunctionStructure> {
  const functions: Dictionary<MidwayHooksFunctionStructure> = {}

  map.forEach((configs) => {
    for (const config of configs) {
      functions[config.gatewayConfig.handler] = config
    }
  })

  return functions
}

export interface MidwayHooksFunctionStructure extends FunctionStructure {
  handler: string
  sourceFilePath?: string
  exportFunction?: string
  isFunctional?: boolean
  argsPath?: string
  gatewayConfig: Partial<GatewayConfig>
}
