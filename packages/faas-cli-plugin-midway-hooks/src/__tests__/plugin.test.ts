import { CommandCore } from '@midwayjs/command-core'
import { loadSpec } from '@midwayjs/serverless-spec-builder'
import { PackagePlugin } from '@midwayjs/fcli-plugin-package'
import { AliyunFCPlugin } from '@midwayjs/fcli-plugin-fc'
import { resolve } from 'path'
import { existsSync, readFileSync, remove } from 'fs-extra'

async function createCli(fixture: string, dist: string) {
  await remove(dist)

  const core = new CommandCore({
    config: {
      servicePath: fixture,
    },
    commands: ['package'],
    service: loadSpec(fixture),
    provider: 'aliyun',
    log: {
      log: () => {},
    },
  })

  core.addPlugin(PackagePlugin)
  core.addPlugin(AliyunFCPlugin)

  await core.ready()
  return core
}

test('package', async () => {
  const fixture = resolve(__dirname, './fixtures/package')
  const dist = resolve(fixture, './.serverless')
  const cli = await createCli(fixture, dist)
  await cli.invoke(['package'])

  expect(existsSync(resolve(dist, 'registerFunction.js'))).toBeTruthy()
  expect(existsSync(resolve(dist, 'index-controller.js'))).toBeTruthy()
  expect(existsSync(resolve(dist, 'index.js'))).toBeTruthy()
})

test('async hooks runtime', async () => {
  const fixture = resolve(__dirname, './fixtures/async_hooks-runtime')
  const dist = resolve(fixture, './.serverless')
  const cli = await createCli(fixture, dist)
  await cli.invoke(['package'])

  const runtime = resolve(dist, 'registerFunction.js')
  expect(existsSync(runtime)).toBeTruthy()
  const content = readFileSync(runtime, 'utf-8')

  expect(content.includes(`process.env.HOOKS_RUNTIME = 'async_hooks'`)).toBeTruthy()
})
