import execa from 'execa'
import check from './sync_status'
import { getPackages } from './util'

const packages = getPackages()
const finished = []

const clients = process.argv.slice(2)

async function syncPackage(pkg: string, clients: string[]) {
  const tasks = clients.map((client) => execa(client, ['sync', pkg]))
  await Promise.all(tasks)

  finished.push(pkg)
  console.log(`[${finished.length}/${packages.length}] ${pkg} sync finished`)
}

async function sync(clients: string[]) {
  console.log('\n=== start sync ===\n')
  const pkgs = packages.map((item) => item.name)

  console.log(`sync ${pkgs.length} packages:\n${pkgs.join('\n')}\n`)
  const task = pkgs.map((pkg) => syncPackage(pkg, clients))
  await Promise.all(task)

  console.log('\n=== check sync status ===\n')
  await check(pkgs, clients)

  console.log('\n=== sync finished ===')
}

sync(clients)
