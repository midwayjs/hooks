import { IMidwayContainer } from '@midwayjs/core'

import { ApiModule } from './types/common'
import { ProjectConfig } from './types/config'

export type SnapShot = {
  root: string
  projectConfig: ProjectConfig
  modules: PreloadModule[]
  container: IMidwayContainer
}

type PreloadModule = {
  file: string
  mod: ApiModule
}

export const SNAPSHOT_SYMBOL = Symbol.for('MIDWAY_HOOKS_SNAPSHOT')
export const SNAPSHOT = globalThis[SNAPSHOT_SYMBOL]

export function setSnapshot(snapshot: SnapShot) {
  globalThis[SNAPSHOT_SYMBOL] = snapshot
}

export function getSnapshot(): SnapShot {
  return globalThis[SNAPSHOT_SYMBOL]
}
