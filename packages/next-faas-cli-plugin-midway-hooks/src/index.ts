import { BasePlugin } from '@midwayjs/fcli-command-core'
import { resolve } from 'path'
import {
  hintConfig,
  helper,
  getFunctionsMeta,
  clearRoutes,
  MidwayHooksFunctionStructure,
} from '@midwayjs/next-hooks-compiler'
import { debug, argsPath } from './util'
import { WatcherConfig, HooksWatcher } from './watcher'
import { transform, EventStructureType } from '@midwayjs/serverless-spec-builder'
import type { SpecStructureWithGateway } from '@midwayjs/hooks-shared'

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

  get apis() {
    return resolve(this.root, 'src/apis')
  }

  get isSkipTsBuild() {
    return this.getStore('skipTsBuild', 'global')
  }

  private static init = false
  private static isCompiled = false

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

    if ((this.core.service as any).functionsRule) {
      helper.rules = (this.core.service as any).functionsRule
      helper.root = resolve(this.root, 'src')
    } else {
      helper.root = this.apis
    }

    clearRoutes()

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
      func.events = [this.createEventsByGateway(func)]
    }

    debug('faas decorator function: %O', this.core.service.functions)
    debug('hooks function: %s', JSON.stringify(functions, null, 2))

    this.core.service.functions = Object.assign(this.core.service.functions, functions)

    if (!MidwayHooksPlugin.isCompiled && process.env.NODE_ENV !== 'production') {
      startWatcher({
        root: this.root,
        apis: this.apis,
      })
      MidwayHooksPlugin.isCompiled = true
    }
  }

  protected get argsPath() {
    return argsPath[this.gateway]
  }

  protected createEventsByGateway(func: MidwayHooksFunctionStructure): EventStructureType {
    const config = func.gatewayConfig
    /**
     * HTTP Case
     */
    return {
      http: {
        method: config.method,
        path: config.url,
      },
    }
  }
}

async function startWatcher(config: WatcherConfig) {
  const watcher = new HooksWatcher(config)

  while (true) {
    await watcher.getNext()
  }
}
