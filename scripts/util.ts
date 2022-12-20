import { getPackagesSync } from '@manypkg/get-packages'
import type { PackageJSON } from '@changesets/types'

export function getPackages(): PackageJSON[] {
  const pkgs = getPackagesSync(process.cwd())

  const midwayPackages = pkgs.packages
    .filter(
      (pkg) =>
        !pkg.packageJson.private && pkg.packageJson.name.startsWith('@midwayjs')
    )
    .map((pkg) => pkg.packageJson)

  return midwayPackages
}
