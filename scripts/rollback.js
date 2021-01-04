const { execSync } = require('child_process')
const { writeFileSync } = require('fs')
const { join } = require('path')

const originData = execSync('npx lerna ls --json').toString()
const data = JSON.parse(originData)

const arr = ['#!/bin/bash\n', `# timestamp: ${new Date().toISOString()}\n\n`]
const diff = ['\n# Changes:\n\n']

for (const item of data) {
  if (item.private === false) {
    const data = execSync(`curl -s https://registry.npmjs.org/${item.name}/latest`).toString()
    arr.push(`npm dist-tag add ${item.name}@${JSON.parse(data).version} latest\n`)
    diff.push(`#  - ${item.name}: ${JSON.parse(data).version} => ${item.version} \n`)
  }
}

writeFileSync(join(__dirname, 'rollback.sh'), arr.join('') + diff.join(''))
