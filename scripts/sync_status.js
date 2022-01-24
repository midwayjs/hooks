const execa = require('execa')

const failed = []
const finished = []

async function checkSyncStatus(packages, pkg, clients) {
  const versions = await Promise.all(
    clients.map((client) => execa(client, ['show', pkg, 'version']))
  )
  const npmVersion = versions[0].stdout

  finished.push(pkg)
  console.log(
    `[${finished.length}/${packages.length}] ----> ${pkg}@${npmVersion}`
  )

  const isSuccess = versions.every((version) => version.stdout === npmVersion)

  if (!isSuccess) {
    console.log(
      `===> ${clients
        .map((client, i) => `${client}: ${versions[i].stdout}`)
        .join(' ')}`
    )
    failed.push(pkg)
  }
}

module.exports = async function check(packages, clients) {
  const task = packages.map((pkg) =>
    checkSyncStatus(packages, pkg, ['npm', ...clients])
  )
  await Promise.all(task)
}
