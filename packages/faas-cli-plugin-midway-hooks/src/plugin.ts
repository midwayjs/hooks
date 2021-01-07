import { BasePlugin } from '@midwayjs/fcli-command-core'
import { resolve } from 'path'
import {
  getFunctionsMeta,
  helper,
  hintConfig,
  hintConfigForAsyncHooks,
  MidwayHooksFunctionStructure,
} from '@midwayjs/next-hooks-compiler'
import { argsPath, debug } from './util'
import { HooksWatcher, WatcherConfig } from './watcher'
import { EventStructureType, transform } from '@midwayjs/serverless-spec-builder'
import type { HooksSpecStructure } from '@midwayjs/hooks-shared'
import { compilerEmitter } from './event'

export class MidwayHooksPlugin extends BasePlugin {
  spec: HooksSpecStructure

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

    helper.root = this.root

    const mwccHintConfig = helper.isAsyncHooksRuntime ? hintConfigForAsyncHooks : hintConfig

    if (!MidwayHooksPlugin.init) {
      MidwayHooksPlugin.init = true
      debug('hintConfig: %O', mwccHintConfig)
    }

    this.setStore('mwccHintConfig', mwccHintConfig, true)
    debug('beforeCompile')
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

    this.core.service.functions = Object.assign(this.core.service.functions ?? {}, functions)

    if (!compilerEmitter.isCompiled && !['production', 'test'].includes(process.env.NODE_ENV)) {
      await startWatcher({
        root: this.root,
        source: helper.source,
      })
    }
    compilerEmitter.isCompiled = true
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
  await watcher.start()
}
