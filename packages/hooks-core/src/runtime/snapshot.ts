import { IMidwayContainer } from '@midwayjs/core'

import { SNAPSHOT_SYMBOL } from '../const'
import { ApiModule } from '../types/common'
import { ProjectConfig } from '../types/config'

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

export function createSnapshot(snapshot: SnapShot) {
  globalThis[SNAPSHOT_SYMBOL] = snapshot
}

export function getSnapshot(): SnapShot {
  return globalThis[SNAPSHOT_SYMBOL]
}
