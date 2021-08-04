import { relative } from 'upath'

export function duplicateLogger(
  root: string,
  existPath: string,
  currentPath: string,
  api: string
) {
  console.log(
    '[%s] Duplicate routes detected. %s and %s both resolve to %s.',
    'warn',
    relative(root, existPath),
    relative(root, currentPath),
    api
  )
}
