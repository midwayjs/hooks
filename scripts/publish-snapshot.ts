import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert'
import { command } from 'execa'
import dedent from 'dedent'
import consola from 'consola'
import { getPackages } from './util'

const dist = path.resolve(__dirname, '../.changeset')
const cwd = path.resolve(__dirname, '..')

const tag = process.argv[2]
assert(tag, 'Tag is required')
assert(typeof tag === 'string', 'Tag must be a string')

async function publishSnapshot() {
  consola.info(`Generate snapshot changeset for ${tag}`)
  const pkgs = getPackages()
  const publicPkgs = pkgs.map((pkg) => pkg.name)
  const changeset = createChangeset(publicPkgs)

  await writeFile(path.resolve(dist, `changeset-${Date.now()}.md`), changeset, {
    encoding: 'utf-8',
  })
  await command(`pnpm changeset version --snapshot ${tag}`, {
    cwd,
    stdio: 'ignore',
  })

  consola.info(`Build packages`)
  await command(`npm run build`, { cwd, stdio: 'inherit' })

  consola.info(`Publish snapshot changeset for ${tag}`)
  await command(`pnpm changeset publish --no-git-tag --tag ${tag}`, {
    cwd,
    stdio: 'inherit',
  })

  await command(`git checkout -- */CHANGELOG.md`, { cwd })
  await command(`git checkout -- packages/*/package.json`, { cwd })
  consola.success(`Snapshot changeset published`)
}

function createChangeset(pkgs: string[]) {
  return dedent`
  ---
  ${pkgs.map((pkg) => `'${pkg}': patch`).join('\n')}
  ---
  
  feat: add snapsnot changeset
  `
}

publishSnapshot()
