import cac from 'cac'
import { join } from 'path'
import { hcc } from './midway'

const cli = cac('hcc')

cli
  .command('[root]', 'Compile a Hooks project into a single file')
  .alias('build')
  .option('--clean', `[boolean] clean previous output content`, {
    default: false,
  })
  .action(async (root: string, options: { clean: boolean }) => {
    await hcc()
  })

cli.version(require(join(__dirname, '../package.json')).version)
cli.help()

cli.parse()
