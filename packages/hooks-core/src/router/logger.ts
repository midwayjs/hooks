/* istanbul ignore file */
import chalk from 'chalk'
import { relative } from 'upath'

export function duplicateLogger(
  root: string,
  existPath: string,
  currentPath: string,
  api: string
) {
  console.log(
    '[%s] Duplicate routes detected. %s and %s both resolve to %s.',
    chalk.yellow('warn'),
    chalk.cyan(relative(root, existPath)),
    chalk.cyan(relative(root, currentPath)),
    chalk.cyan(api)
  )
}
