import { createDebug } from '@midwayjs/hooks-core'
import findUp from 'find-up'
import { dirname } from 'upath'
import { HOOKS_PROJECT_ROOT } from './const'

const debug = createDebug('hooks-internal:root')

export function setProjectRoot(root: string) {
  debug('setProjectRoot: %s', root)
  process.env[HOOKS_PROJECT_ROOT] = root
}

export function getProjectRoot(cwd?: string) {
  if (process.env[HOOKS_PROJECT_ROOT]) {
    return process.env[HOOKS_PROJECT_ROOT]
  }

  const pkg = findUp.sync('package.json', { cwd })
  if (pkg) {
    return dirname(pkg)
  }

  return process.cwd()
}
