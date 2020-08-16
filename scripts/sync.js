const { execSync } = require('child_process')
const execa = require('execa')
const { resolve } = require('path')

const originData = execSync('npx lerna ls --json').toString()
const data = JSON.parse(originData)

async function syncPackage(pkg) {
  console.log(`start sync ${pkg}`)
  await execa('tnpm', ['sync', pkg])
  console.log(`${pkg} sync finished`)
}

async function sync() {
  const task = data.map((item) => syncPackage(item.name))
  await Promise.all(task)
  await execa('node', [resolve(__dirname, 'sync_status.js')])
  process.exit(1)
}

sync()
