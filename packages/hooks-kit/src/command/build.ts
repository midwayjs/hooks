import { CAC } from 'cac'
import { build, InlineConfig, mergeConfig } from 'vite'
import { join, resolve } from 'path'
import { CommandCore } from '@midwayjs/command-core'
import { BuildPlugin } from '@midwayjs/cli-plugin-build'
import fs from 'fs'
import { getProjectRoot } from '@midwayjs/hooks/internal'
import { resolveConfig } from '../config'
import consola from 'consola'
import { vite } from '@midwayjs/hooks-bundler'

type BuildOptions = {
  outDir: string
  clean: boolean
}

export function setupBuildCommand(cli: CAC) {
  cli
    .command('build [root]')
    .option('--outDir <dir>', `[string] output directory (default: dist)`)
    .option('--clean', `[boolean] clean output directory before build`, {
      default: false,
    })
    .action(async (root: string, options: BuildOptions) => {
      const projectRoot = getProjectRoot()
      const userConfig = resolveConfig(projectRoot)
      const outDir = options.outDir || userConfig.build.outDir

      if (options.clean && fs.existsSync(outDir)) {
        consola.info('clean output directory before build')
        await fs.promises.rm(outDir, { recursive: true })
      }

      root = root ? resolve(root) : projectRoot

      const client = join(outDir, '_client')
      const defaultConfig: InlineConfig = {
        root,
        configFile: false,
        plugins: [vite()],
        build: {
          outDir: client,
          manifest: true,
        },
      }

      try {
        consola.info('Building client...')
        const clientBuild = await executePromise(
          build(mergeConfig(defaultConfig, userConfig?.vite))
        )
        consola.success(`Client built in ${clientBuild.time}ms`)

        consola.info('Building server...')
        if (userConfig.static) {
          consola.info(
            'Static files and html will be automatically served from server'
          )
          createRender(join(root, outDir))
        } else {
          consola.info(
            'Serve static disabled, you should serve static files manually'
          )
        }

        const serverBuild = await executePromise(buildServer(root, outDir))
        consola.success(`Server built in ${serverBuild.time}ms`)

        const pkg = require(join(projectRoot, 'package.json'))
        // Web
        if (pkg.dependencies['@midwayjs/koa']) {
          consola.info('Use `npm start` to start server!')
        }
      } catch (e) {
        consola.error(`error during build:\n${e.stack}`),
          {
            error: e,
          }
      }
    })
}

async function executePromise(promise: Promise<any> | any) {
  const start = Date.now()
  const result = await promise
  const time = Date.now() - start

  return {
    result,
    time,
  }
}

function createRender(dist: string) {
  const code = `
  const { Api, Get, Middleware } = require('@midwayjs/hooks');
  const cache = require('koa-static-cache');
  const path = require('path');
  
  const client = path.join(__dirname, '_client');

  exports.default = Api(
    Get('/*'),
    Middleware(
      cache({
        dir: client,
        dynamic: true,
        alias: { '/': 'index.html' },
        buffer: true,
      })
    ),
    async () => {}
  );
  `

  fs.writeFileSync(join(dist, '_serve.js'), code, 'utf-8')
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
