import { LambdaParam } from '@midwayjs/hooks-shared'
import art from 'art-template'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { transform } from '@midwayjs/serverless-spec-builder'
import type { SpecStructureWithGateway } from '@midwayjs/hooks-shared'

art.defaults.htmlMinifierOptions = {
  collapseWhitespace: false,
  minifyCSS: false,
  minifyJS: false,
  ignoreCustomFragments: [],
}

art.defaults.imports.stringify = (json: string) => JSON.stringify(json, null, 2)
;(art.defaults as any).escape = false

export interface RenderParam extends Partial<LambdaParam> {
  isExportDefault?: boolean
  functionId?: string
}

export interface BuildOptions {
  beforeBuildRequest(params: RenderParam[]): void
}

export function buildRequest(funcs: RenderParam[], cwd: string, options?: BuildOptions) {
  const { gateway, functionGroup } = getFunctionConfig(cwd)

  funcs.forEach((func) => {
    func.meta.functionGroup = functionGroup
    func.meta.gateway = gateway
  })

  options?.beforeBuildRequest?.(funcs)

  const template = readFileSync(resolve(__dirname, `../templates/request.art`), { encoding: 'utf-8' })
  return art.render(template, { funcs })
}

function getFunctionConfig(cwd: string) {
  const spec: SpecStructureWithGateway = transform(resolve(cwd, 'f.yml'))

  return {
    gateway: spec?.apiGateway?.type ?? 'http',
    functionGroup: spec.service.name,
  }
}
