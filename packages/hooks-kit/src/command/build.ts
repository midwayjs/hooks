import { CAC } from 'cac'
import { build, InlineConfig, mergeConfig } from 'vite'
import colors from 'picocolors'
import { join, resolve } from 'path'
import { CommandCore } from '@midwayjs/command-core'
import { BuildPlugin } from '@midwayjs/cli-plugin-build'
import fs from 'fs'
import { getProjectRoot } from '@midwayjs/hooks/internal'
import { resolveConfig } from '../config'

type BuildOptions = {
  outDir: string
}

export function setupBuildCommand(cli: CAC) {
  cli
    .command('build [root]')
    .option('--outDir <dir>', `[string] output directory (default: dist)`)
    .action(async (root: string, options: BuildOptions) => {
      const projectRoot = getProjectRoot()
      const userConfig = resolveConfig(projectRoot)
      const outDir = options.outDir || userConfig.build.outDir
      root = root ? resolve(root) : projectRoot

      const client = join(outDir, '_client')
      const defaultConfig: InlineConfig = {
        root,
        configFile: false,
        plugins: [require('@midwayjs/hooks/bundler').vite()] as any,
        build: {
          outDir: client,
          manifest: true,
        },
      }

      try {
        await build(mergeConfig(defaultConfig, userConfig?.vite))
        createRender(join(root, outDir))
        await buildServer(root, outDir)
      } catch (e) {
        console.error(colors.red(`error during build:\n${e.stack}`), {
          error: e,
        })
      }
    })
}

function createRender(dist: string) {
  const clientDir = join(dist, '_client')
  const code = `
  const { Api, Get, Middleware } = require('@midwayjs/hooks');
  const static = require('koa-static-cache');
  const path = require('path');

  exports.default = Api(
    Get('/*'),
    Middleware(
      static({
        dir: '${clientDir}',
        dynamic: true,
        alias: { '/': 'index.html' },
        buffer: true,
      })
    ),
    async () => {}
  );
  `

  fs.writeFileSync(join(dist, '_render.js'), code, 'utf-8')
}

async function buildServer(cwd: string, outDir: string) {
  const core = new CommandCore({
    commands: ['build'],
    cwd,
    log: {
      log: () => {},
    },
    options: {
      outDir,
    },
  })
  core.addPlugin(BuildPlugin)
  await core.ready()
  await core.invoke()
}
