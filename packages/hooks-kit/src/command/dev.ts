import { CAC } from 'cac'
import { createServer, InlineConfig, mergeConfig } from 'vite'
import { resolveConfig } from '../config'
import { resolve } from 'path'
import { vite } from '@midwayjs/hooks-bundler'
import { getProjectRoot } from '@midwayjs/hooks/internal'

type DevOptions = {
  port: number
  host: string
  force: boolean
}

export function setupDevCommand(cli: CAC) {
  cli
    .command('[root]', 'Start development server')
    .alias('dev')
    .option('-p, --port <port>', '[number] specify port', { default: 3000 })
    .option('-h, --host [host]', '[string] specify hostname', {
      default: 'localhost',
    })
    .option(
      '-f, --force',
      '[boolean] force the optimizer to ignore the cache and re-bundle',
      {
        default: false,
      }
    )
    .action(async (root: string, options: DevOptions) => {
      root = root ? resolve(root) : getProjectRoot()

      const userConfig = {
        source: 'src/api',
        ...resolveConfig(root),
      }
      const defaultConfig: InlineConfig = {
        root,
        configFile: false,
        server: {
          port: options.port,
          host: options.host,
          force: options.force,
        },
        plugins: [vite()],
      }

      const config = mergeConfig(defaultConfig, userConfig?.vite)
      const server = await createServer(config)
      await server.listen()

      server.printUrls()
    })
}
