import { BasePlugin } from '@midwayjs/fcli-command-core'
import { resolve } from 'path'
import { getFunctionsMeta, helper, hintConfig, MidwayHooksFunctionStructure } from '@midwayjs/next-hooks-compiler'
import { argsPath, debug } from './util'
import { HooksWatcher, WatcherConfig } from './watcher'
import { EventStructureType, transform } from '@midwayjs/serverless-spec-builder'
import type { SpecStructureWithGateway } from '@midwayjs/hooks-shared'
import { compilerEmitter } from './event'

export class MidwayHooksPlugin extends BasePlugin {
  spec: SpecStructureWithGateway

  get gateway() {
    if (!this.spec) {
      this.spec = transform(resolve(this.root, 'f.yml'))
    }

    return this.spec.apiGateway?.type ?? 'http'
  }

  get root() {
    return this.core.config.servicePath
  }

  get isSkipTsBuild() {
    return this.getStore('skipTsBuild', 'global')
  }

  private static init = false

  hooks = {
    'before:invoke:compile': async () => {
      this.beforeCompile()
    },
    'after:invoke:emit': async () => {
      await this.afterCompile()
    },
    'before:package:compile': async () => {
      this.beforeCompile()
    },
    'after:package:emit': async () => {
      await this.afterCompile()
    },
  }

  beforeCompile() {
    if (this.isSkipTsBuild) {
      return
    }

    if (!MidwayHooksPlugin.init) {
      debug('hintConfig: %O', hintConfig)
      MidwayHooksPlugin.init = true
    }

    debug('beforeCompile')

    helper.root = this.root
    this.setStore('mwccHintConfig', hintConfig, true)
  }

  async afterCompile() {
    if (this.isSkipTsBuild) {
      return
    }

    debug('afterCompile')

    const functions = getFunctionsMeta()
    for (const func of Object.values(functions)) {
      func.gatewayConfig.meta.gateway = this.gateway
      func.argsPath = this.argsPath
      func.events = this.createEventsByGateway(func)
    }

    debug('faas decorator function: %O', this.core.service.functions)
    debug('hooks function: %s', JSON.stringify(functions, null, 2))

    this.core.service.functions = Object.assign(this.core.service.functions ?? {}, functions)

    if (!compilerEmitter.isCompiled && !['production', 'test'].includes(process.env.NODE_ENV)) {
      startWatcher({
        root: this.root,
        source: helper.source,
      })
      compilerEmitter.isCompiled = true
    }
  }

  protected get argsPath() {
    return argsPath[this.gateway]
  }

  protected createEventsByGateway(func: MidwayHooksFunctionStructure): EventStructureType[] {
    const events = []
    const config = func.gatewayConfig

    for (const key of Object.keys(func.event)) {
      if (key === 'http') {
        events.push({
          http: {
            method: config.method,
            path: config.url,
          },
        })
        continue
      }

      console.log('Unsupport gateway type: ', key, func.event[key])
    }

    return events
  }
}

async function startWatcher(config: WatcherConfig) {
  const watcher = new HooksWatcher(config)

  while (true) {
    await watcher.getNext()
  }
}
