import { getPackages } from './util'
import assert from 'node:assert'
import { command } from 'execa'
import consola from 'consola'

const tag = process.argv[2]
assert(tag, 'Tag is required')
assert(typeof tag === 'string', 'Tag must be a string')

async function removeTags() {
  const pkgs = getPackages().map((pkg) => pkg.name)
  const failedPackages: string[] = []

  for (const pkg of pkgs) {
    try {
      await command(`npm dist-tag rm ${pkg} ${tag}`, { stdio: 'ignore' })
      consola.success(`${pkg}@${tag} removed!`)
    } catch {
      failedPackages.push(pkg)
    }
  }

  if (failedPackages.length) {
    consola.error(
      `Failed to remove tag ${tag} from ${failedPackages.join(', ')}`
    )
  }
}

removeTags()
