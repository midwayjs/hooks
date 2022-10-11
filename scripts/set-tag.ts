// use case: esno scripts/set-tag.ts dev-pack 0.0.0-dev-pack-20220725082840
import { getPackages } from './util'
import assert from 'node:assert'
import { command } from 'execa'
import consola from 'consola'

const tag = process.argv[2]

assert(tag, 'Tag is required')
assert(typeof tag === 'string', 'Tag must be a string')

const version = process.argv[3]
assert(version, 'Version is required')
assert(typeof version === 'string', 'Version must be a string')

async function setTags() {
  const pkgs = getPackages().map((pkg) => pkg.name)

  for (const pkg of pkgs) {
    try {
      await command(`npm dist-tag add ${pkg}@${version} ${tag}`, {
        stdio: 'ignore',
      })
      consola.success(`${pkg}@${tag} set to ${version}!`)
    } catch {}
  }
}

setTags()
