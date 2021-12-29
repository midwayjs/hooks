import { CommandCore } from '@midwayjs/command-core'
import { BuildPlugin } from '@midwayjs/cli-plugin-build'
import type { Plugin } from 'vite'
import { getProjectRoot } from '../internal'

async function buildProject(cwd: string) {
  const core = new CommandCore({
    commands: ['build'],
    cwd,
    log: {
      log: () => {},
    },
  })
  core.addPlugin(BuildPlugin)
  await core.ready()
  await core.invoke()
}

const root = getProjectRoot()

export function build() {
  return {
    name: '@midwayjs/hooks/bundler/build',
    apply: 'build',
    enforce: 'pre',
    async buildStart() {
      console.log('[midway] start build')
      await buildProject(root)
      console.log('[midway] done')
    },
  } as Plugin
}
