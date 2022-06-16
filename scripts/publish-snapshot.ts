import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { command } from 'execa'
import assert from 'node:assert'
import { execSync } from 'node:child_process'
import dedent from 'dedent'

const dist = path.resolve(__dirname, '../.changeset')
const cwd = path.resolve(__dirname, '..')

const tag = process.argv[2]
assert(tag, 'Tag is required')
assert(typeof tag === 'string', 'Tag must be a string')

type LernaPackage = {
  name: string
  version: string
  private: boolean
  location: string
}

async function publishSnapshot() {
  console.log(`Generate snapshot changeset for ${tag}`)
  const pkgs: LernaPackage[] = JSON.parse(
    execSync('npx lerna ls --json').toString()
  )
  const publicPkgs = pkgs
    .filter((pkg) => !pkg.private && pkg.name.startsWith('@midwayjs'))
    .map((pkg) => pkg.name)
  const changeset = createChangeset(publicPkgs)

  await writeFile(path.resolve(dist, `changeset-${Date.now()}.md`), changeset, {
    encoding: 'utf-8',
  })
  await command(`yarn changeset version --snapshot ${tag}`, {
    cwd,
    stdio: 'ignore',
  })

  console.log(`Build packages`)
  await command(`npm run build`, { cwd, stdio: 'inherit' })

  console.log(`Publish snapshot changeset for ${tag}`)
  await command(`yarn changeset publish --no-git-tag --tag ${tag}`, {
    cwd,
    stdio: 'inherit',
  })

  await command(`git checkout -- */CHANGELOG.md`, { cwd })
  await command(`git checkout -- packages/*/package.json`, { cwd })
  console.log(`\nSnapshot changeset published`)
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
