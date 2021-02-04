import { BasePlugin } from '@midwayjs/fcli-command-core'
import { getFuncList } from '@midwayjs/fcli-plugin-invoke'
import { resolve } from 'path'
import ora from 'ora'
import Table from 'cli-table3'
import { MidwayHooksFunctionStructure } from '@midwayjs/next-hooks-compiler'
import chalk from 'chalk'
import _ from 'lodash'
import { HTTPEvent } from '@midwayjs/serverless-spec-builder'

export class RoutesPlugin extends BasePlugin {
  commands = {
    routes: {
      usage: 'View the generated routes information',
      lifecycleEvents: ['view'],
    },
  }

  hooks = {
    'routes:view': async () => {
      const start = Date.now()
      const spinner = ora('Compiling').start()

      let localFunctions: _.Dictionary<MidwayHooksFunctionStructure>
      try {
        localFunctions = await getFuncList({
          functionDir: this.root,
          sourceDir: this.apis,
        })
      } catch (e) {
        spinner.stopAndPersist({
          prefixText: '✖',
          text: 'Compile error',
        })
        throw e
      }

      spinner.stopAndPersist({
        prefixText: '✓',
        text: 'Compiled',
      })

      const table = new Table({
        head: [chalk.cyanBright('HTTP'), chalk.cyanBright('URI'), chalk.cyanBright('Source File')],
        style: {
          head: [],
          border: [],
        },
      })

      const funcs = Object.values(localFunctions)

      for (const func of funcs) {
        if (!func.gatewayConfig) {
          const event: HTTPEvent = func.events[0].http
          table.push([event.method.toString(), event.path, '-'])
          continue
        }

        table.push([func.gatewayConfig.method, func.gatewayConfig.url, func.sourceFilePath.replace(/\.js$/, '.ts')])
      }

      console.log(table.toString())
      const end = ((Date.now() - start) / 1024).toFixed(2)
      const fileCount = Object.keys(_.groupBy(funcs, (func) => func.sourceFile)).length
      console.log(`🚀  Done in ${end}s. Found ${funcs.length} api in ${fileCount} lambda files`)
    },
  }

  get root() {
    return this.core.config.servicePath
  }

  get apis() {
    return resolve(this.root, 'src/apis')
  }
}
