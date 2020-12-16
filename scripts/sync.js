const { execSync } = require('child_process')
const execa = require('execa')
const { resolve } = require('path')
const check = require('./sync_status')

const originData = execSync('npx lerna ls --json').toString()
const data = JSON.parse(originData)
const finished = []

const clients = process.argv.slice(2)

async function syncPackage(pkg, clients) {
  const tasks = clients.map((client) => execa(client, ['sync', pkg]))
  await Promise.all(tasks)

  finished.push(pkg)
  console.log(`[${finished.length}/${data.length}] ${pkg} sync finished`)
}

async function sync(clients) {
  console.log('\n=== start sync ===\n')
  const packages = data.map((item) => item.name)

  console.log(`sync ${packages.length} packages:\n${packages.join('\n')}\n`)
  const task = packages.map((pkg) => syncPackage(pkg, clients))
  await Promise.all(task)

  console.log('\n=== check sync status ===\n')
  await check(packages, clients)

  console.log('\n=== sync finished ===')
}

sync(clients)
