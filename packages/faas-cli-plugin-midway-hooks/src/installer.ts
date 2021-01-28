import { BasePlugin } from '@midwayjs/fcli-command-core'
import { resolve, join, isAbsolute } from 'path'
import _ from 'lodash'
import { setupTsnode } from './util'
import download from 'download'
import { RecipeExecutor, setPackageManager } from '@midwayjs/installer'
import { existsSync, mkdirp, readJSON, remove } from 'fs-extra'
import execa from 'execa'
import { tmpdir } from 'os'

export class InstallPlugin extends BasePlugin {
  commands = {
    install: {
      usage: 'install midway recipes',
      lifecycleEvents: ['recipe'],
      options: {
        recipe: {
          usage: 'specify a recipe to install',
          shortcut: 'r',
          default: null,
        },
        client: {
          usage: 'set npm client, by default is npm or yarn',
          shortcut: 'c',
          default: null,
        },
      },
    },
  }

  hooks = {
    'install:recipe': async () => {
      const { recipe, client } = this.options
      const originCwd = process.cwd()

      if (!recipe) {
        console.log('You must specify a recipe to install')
        return
      }

      const npmClient = client
        ? client
        : existsSync(resolve(this.root, 'yarn.lock'))
        ? 'yarn'
        : 'npm'

      setPackageManager(npmClient)
      setupTsnode()

      const directory =
        recipe.startsWith('.') || isAbsolute(recipe)
          ? recipe
          : await this.downloadRecipe(npmClient, recipe)

      process.chdir(originCwd)
      await this.installRecipe(directory)
    },
  }

  async downloadRecipe(client: string, packageName: string) {
    const recipeDir = join(
      tmpdir(),
      `midway-recipe-${_.camelCase(packageName)}`
    )
    // clean up from previous run in case of error
    await remove(recipeDir)
    await mkdirp(recipeDir)

    process.chdir(recipeDir)
    const { stdout, stderr } = await execa(client, [
      'info',
      packageName,
      '--json',
    ])
    if (stderr) {
      throw stderr
    }

    const data = client.includes('yarn')
      ? JSON.parse(stdout).data
      : JSON.parse(stdout)
    const tarball = data.dist.tarball
    await download(tarball, recipeDir, { extract: true })

    const dist = join(recipeDir, 'package')

    await execa(client, ['install', '--production'], {
      stdio: 'inherit',
      cwd: dist,
    })
    return dist
  }

  private async installRecipe(directory: string) {
    const { main } = await readJSON(resolve(directory, 'package.json'))
    const recipe = require(resolve(directory, main))
      .default as RecipeExecutor<any>
    await recipe.run({})
  }

  get root() {
    return this.core.config.servicePath
  }
}
