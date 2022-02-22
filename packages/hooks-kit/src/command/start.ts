import { CAC } from 'cac'
import { resolve } from 'path'
import { Bootstrap } from '@midwayjs/bootstrap'
import { setConfig, setProjectRoot } from '@midwayjs/hooks/internal'
import consola from 'consola'
import { resolveConfig } from '../config'

type StartOptions = {
  port: number
  host: string
}

export function setupStartCommand(cli: CAC) {
  cli
    .command('start [root]')
    .option('-p, --port <port>', '[number] specify port', { default: 3000 })
    .option('-h, --host [host]', '[string] specify hostname', {
      default: 'localhost',
    })
    .action(async (root: string, options: StartOptions) => {
      root = root ? resolve(root) : resolve('dist')

      const config = {
        ...resolveConfig(root),
        build: {
          outDir: './',
        },
      }

      setProjectRoot(root)
      setConfig(config)

      process.env.MIDWAY_HTTP_PORT = options.port.toString()

      const server = Bootstrap.configure({
        baseDir: root,
        ignore: ['**/_client/**'],
      })

      await server.run()
      consola.success(
        `Your application is running at http://localhost:${options.port}`
      )
    })
}
