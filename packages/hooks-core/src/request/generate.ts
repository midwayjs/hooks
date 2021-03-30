import { init, parse } from 'es-module-lexer'
import { ApiParam } from '..'
import _ from 'lodash'
import art from 'art-template'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import prettier from 'prettier'

interface RenderParam extends Partial<ApiParam> {
  isExportDefault?: boolean
  name?: string
}

// TODO Refactor SDK generator to support custom request sdk
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

  const template = readFileSync(
    resolve(__dirname, '../../template/request.art'),
    { encoding: 'utf-8' }
  )
  return prettier.format(art.render(template, { funcs, SDK: sdk }), {
    semi: true,
    singleQuote: true,
    parser: 'babel',
  })
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
