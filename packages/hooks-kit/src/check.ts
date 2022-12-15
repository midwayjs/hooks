import { join } from 'path'
import consola from 'consola'
import { compareVersions } from 'compare-versions'
import fs from 'fs'

export function checkForViteDeps(cwd: string) {
  const json = require(join(cwd, 'package.json'))
  const deps = {
    ...json.dependencies,
    ...json.devDependencies,
  }

  if (
    deps['@vitejs/plugin-react'] &&
    compareVersions(deps['@vitejs/plugin-react'], '3.0.0') < 0
  ) {
    consola.error(
      `@vitejs/plugin-react version is ${deps['@vitejs/plugin-react']}, please upgrade version for Vite 4`
    )
    throw new Error('Vite 4 requires @vitejs/plugin-react@3')
  }

  if (
    deps['@vitejs/plugin-vue'] &&
    compareVersions(deps['@vitejs/plugin-vue'], '4.0.0') < 0
  ) {
    consola.error(
      `@vitejs/plugin-vue version is ${deps['@vitejs/plugin-vue']}, please upgrade version for Vite 4`
    )
    throw new Error('Vite 4 requires @vitejs/plugin-vue@4')
  }

  if (fs.existsSync(join(cwd, 'pnpm-lock.yaml')) && !deps['@midwayjs/serve']) {
    consola.error(
      `@midwayjs/serve is required for pnpm project, please install @midwayjs/serve`
    )
    throw new Error('@midwayjs/serve is required for pnpm project')
  }
}
