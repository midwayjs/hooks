import { CAC } from 'cac'
import { resolve } from 'path'
import { Bootstrap } from '@midwayjs/bootstrap'
import { setConfig, getProjectRoot } from '@midwayjs/hooks/internal'
import { resolveConfig } from '../config'

type StartOptions = {
  port: number
  host: string
}

export function setupStartCommand(cli: CAC) {
  cli
    .command('start [root]')
    .option('-p, --port <port>', '[number] specify port', { default: 3000 })
    .option('-h, --host <host>', '[string] specify hostname', {
      default: 'localhost',
    })
    .action(async (root: string, options: StartOptions) => {
      const userConfig = resolveConfig(getProjectRoot())

      if (root) {
        setConfig({ build: { outDir: root } })
        root = resolve(root)
      } else {
        root = resolve(userConfig.build.outDir)
      }

      // TODO read midway.config.ts
      process.env.MIDWAY_HTTP_PORT = options.port.toString()

      const server = Bootstrap.configure({
        baseDir: root,
        ignore: ['**/_client/**'],
      })

      await server.run()
      console.log(
        `Your application is running at http://localhost:${options.port}`
      )
    })
}
