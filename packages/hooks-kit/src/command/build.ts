import { CAC } from 'cac'
import { build, InlineConfig, mergeConfig, Manifest } from 'vite'
import colors from 'picocolors'
import { resolveConfig } from '../config'
import { resolve, join } from 'path'
import { CommandCore } from '@midwayjs/command-core'
import { BuildPlugin } from '@midwayjs/cli-plugin-build'
import fs from 'fs'

type BuildOptions = {
  outDir: string
}

export function setupBuildCommand(cli: CAC) {
  cli
    .command('build [root]')
    .option('--outDir <dir>', `[string] output directory (default: dist)`, {
      default: 'dist',
    })
    .action(async (root: string, options: BuildOptions) => {
      root = root ? resolve(root) : process.cwd()

      const client = join(options.outDir, '_client')
      const userConfig = resolveConfig(root)
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
        await build(mergeConfig(defaultConfig, userConfig))
        createRender(join(root, options.outDir))
        await buildServer(root)
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
  const { Decorate, Get, Middleware } = require('@midwayjs/hooks');
  const static = require('koa-static-cache');
  const path = require('path');

  exports.default = Decorate(
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

async function buildServer(cwd: string) {
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
