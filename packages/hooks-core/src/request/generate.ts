import art from 'art-template'
import { init, parse } from 'es-module-lexer'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

import { ApiParam } from '..'

interface RenderParam extends Partial<ApiParam> {
  isExportDefault?: boolean
  name?: string
}

export async function generate(
  baseUrl: string,
  code: string,
  superjson: boolean,
  sdk: string
) {
  await init
  const [, exports] = parse(code)

  if (exports.length === 0) {
    return null
  }

  const funcs: RenderParam[] = exports.map((name) => {
    return {
      url: getUrl(baseUrl, name),
      meta: {
        superjson,
      },
      isExportDefault: name === 'default',
      name: name === 'default' ? '$default' : name,
    }
  })

  const templates = {
    dev: resolve(__dirname, '../../template/request.art'),
    prod: resolve(__dirname, '../template/request.art'),
  }

  const templatePath = existsSync(templates.dev)
    ? templates.dev
    : templates.prod
  const template = readFileSync(templatePath, { encoding: 'utf-8' })
  const result = art.render(template, { funcs, SDK: sdk })

  try {
    const prettier = require('prettier')
    return prettier.format(result, {
      semi: true,
      singleQuote: true,
      parser: 'babel',
    })
  } catch {
    return result
  }
}

function getUrl(baseUrl: string, name: string) {
  if (name === 'default') {
    return baseUrl
  }

  if (baseUrl.endsWith('/')) {
    return `${baseUrl}${name}`
  }

  return `${baseUrl}/${name}`
}

art.defaults.htmlMinifierOptions = {
  collapseWhitespace: false,
  minifyCSS: false,
  minifyJS: false,
  ignoreCustomFragments: [],
}

art.defaults.imports.stringify = (json: string) => JSON.stringify(json, null, 2)
;(art.defaults as any).escape = false
