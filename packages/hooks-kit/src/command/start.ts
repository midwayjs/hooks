import { CAC } from 'cac'
import { resolve } from 'path'
import { Bootstrap } from '@midwayjs/bootstrap'
import { setConfig } from '@midwayjs/hooks/internal'
import consola from 'consola'

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
      if (root) {
        setConfig({ build: { outDir: root } })
        root = resolve(root)
      } else {
        setConfig({ build: { outDir: 'dist' } })
        root = resolve('dist')
      }

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
