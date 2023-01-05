import cac from 'cac'
import { join } from 'path'
import { checkForViteDeps } from './check'
import { setupBuildCommand } from './command/build'
import { setupDevCommand } from './command/dev'
import { setupStartCommand } from './command/start'

export { defineConfig } from './config'

const cli = cac('hooks')

checkForViteDeps(process.cwd())
setupDevCommand(cli)
setupBuildCommand(cli)
setupStartCommand(cli)

cli.version(require(join(__dirname, '../package.json')).version)
cli.help()

cli.parse()
