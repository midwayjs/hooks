import { BasePlugin } from '@midwayjs/fcli-command-core'
import { resolve } from 'path'
import {
  getFunctionsMeta,
  helper,
  hintConfig,
  hintConfigForAsyncHooks,
} from '@midwayjs/next-hooks-compiler'
import { argsPath, debug } from './util'
import { HooksWatcher, WatcherConfig } from './watcher'
import {
  EventStructureType,
  transform,
} from '@midwayjs/serverless-spec-builder'
import type {
  HooksSpecStructure,
  MidwayHooksFunctionStructure,
} from '@midwayjs/hooks-core'
import { compilerEmitter } from './event'
import semver from 'semver'

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

    if (helper.isAsyncHooksRuntime && semver.lt(process.version, '12.17.0')) {
      throw new Error(
        `async_hooks runtime require node version >= 12.17.0, current version: ${process.version}, reference: https://nodejs.org/dist/latest-v15.x/docs/api/async_hooks.html#async_hooks_class_asynclocalstorage`
      )
    }

    const mwccHintConfig = helper.isAsyncHooksRuntime
      ? hintConfigForAsyncHooks
      : hintConfig

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

    this.core.service.functions = Object.assign(
      this.core.service.functions ?? {},
      functions
    )

    if (
      !compilerEmitter.isCompiled &&
      !['production', 'test'].includes(process.env.NODE_ENV)
    ) {
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

  protected createEventsByGateway(
    func: MidwayHooksFunctionStructure
  ): EventStructureType[] {
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
