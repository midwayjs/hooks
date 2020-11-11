import { CommandCore } from '@midwayjs/command-core'
import { loadSpec } from '@midwayjs/serverless-spec-builder'
import { PackagePlugin } from '@midwayjs/fcli-plugin-package'
import { AliyunFCPlugin } from '@midwayjs/fcli-plugin-fc'
import { resolve } from 'path'
import { existsSync, remove } from 'fs-extra'

test('package', async () => {
  const fixture = resolve(__dirname, './fixtures/package')
  const dist = resolve(fixture, './.serverless')

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
  await core.invoke(['package'])

  expect(existsSync(resolve(dist, 'registerFunction.js'))).toBeTruthy()
  expect(existsSync(resolve(dist, 'index-controller.js'))).toBeTruthy()
  expect(existsSync(resolve(dist, 'index.js'))).toBeTruthy()
})
