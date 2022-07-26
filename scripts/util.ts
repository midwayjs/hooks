import { execSync } from 'node:child_process'

export type LernaPackage = {
  name: string
  version: string
  private: boolean
  location: string
}

export function getPackages() {
  const pkgs: LernaPackage[] = JSON.parse(
    execSync('npx lerna ls --json').toString()
  )

  const publicPkgs = pkgs.filter(
    (pkg) => !pkg.private && pkg.name.startsWith('@midwayjs')
  )

  return publicPkgs
}
