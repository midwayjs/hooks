import { copyFile } from 'node:fs/promises'
import path from 'node:path'
import { command } from 'execa'
import assert from 'node:assert'

const template = path.resolve(__dirname, '../template/changeset.md')
const dist = path.resolve(__dirname, '../.changeset')
const cwd = path.resolve(__dirname, '..')

const tag = process.argv[2]
assert(tag, 'Tag is required')
assert(typeof tag === 'string', 'Tag must be a string')

async function publishSnapshot() {
  console.log(`Generate snapshot changeset for ${tag}`)
  await copyFile(template, path.resolve(dist, `changeset-${Date.now()}.md`))
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

publishSnapshot()
