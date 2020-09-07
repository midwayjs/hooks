import { LambdaHTTPMethod } from '@midwayjs/hooks-shared'
import { codeFrameColumns } from '@babel/code-frame'
import * as parser from '@babel/parser'
import traverse, { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import { Identifier, FunctionDeclaration } from '@babel/types'
import { resolve } from 'path'
import inside from 'path-is-inside'
import { loader } from 'webpack'
import { buildRequest, RenderParam } from './render'
import { helper, getFunctionHandlerName } from '@midwayjs/next-hooks-compiler'
import { debug } from './util'

export default async function loader(this: loader.LoaderContext, source: string, sourceMap: string) {
  const callback = this.async()
  const resourcePath = this.resourcePath

  if (resourcePath.includes('node_modules')) {
    return callback(null, source)
  }

  const apis = resolve(this.rootContext, 'src/apis/lambda')

  if (!inside(resourcePath, apis)) {
    return callback(null, source)
  }

  debug('compile %s', resourcePath)

  let ast: t.File
  try {
    ast = parser.parse(source, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'classProperties',
        'objectRestSpread',
        'optionalCatchBinding',
        'dynamicImport',
        'decorators-legacy',
        'asyncGenerators',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'optionalCatchBinding',
        'throwExpressions',
        'optionalChaining',
        'nullishCoalescingOperator',
      ],
    })
  } catch (error) {
    error.message = codeFrameColumns(source, error.loc, {
      highlightCode: true,
      message: error.message,
    })
    throw error
  }

  helper.root = this.rootContext

  const funcs: RenderParam[] = []

  let err: Error

  /**
   * Cases in which export is allowed
   *
   * 1. export async function demo () {}
   * 2. export const demo = async function () {}
   * 3. export const demo = async () => {}
   * 4. export default async function demo () {}
   * 5. export default async function () {}
   * 6. export default async () => {}
   */
  traverse(ast, {
    ExportNamedDeclaration(path) {
      const func: RenderParam = {}
      const declaration = path.node.declaration

      if (t.isTSTypeAliasDeclaration(declaration) || t.isTSInterfaceDeclaration(declaration)) {
        return
      }

      if (t.isFunctionDeclaration(declaration)) {
        const id = declaration.id

        func.url = helper.getHTTPPath(resourcePath, id.name, false)

        const { method, params } = parseFunctionParams(declaration.params)
        func.method = method

        func.meta = {
          functionName: getFunctionHandlerName({
            sourceFilePath: resourcePath,
            isExportDefault: false,
            functionName: id.name,
          }),
          unstable_params: params,
        }
        func.functionId = id.name

        funcs.push(func)
        return
      }

      if (t.isVariableDeclaration(declaration)) {
        for (const variableDeclarator of declaration.declarations) {
          const id = variableDeclarator.id as Identifier
          const init = variableDeclarator.init

          func.url = helper.getHTTPPath(resourcePath, id.name, false)
          func.meta = {
            functionName: getFunctionHandlerName({
              sourceFilePath: resourcePath,
              isExportDefault: false,
              functionName: id.name,
            }),
          }
          func.functionId = id.name

          if (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init)) {
            const { method, params } = parseFunctionParams(init.params)
            func.method = method
            func.meta.unstable_params = params
          } else {
            err = buildCodeFrameError(path, getErrorMessage())
            path.stop()
            return
          }

          funcs.push(func)
        }
        return
      }

      err = buildCodeFrameError(path, getErrorMessage())
      path.stop()
    },
    ExportDefaultDeclaration(path) {
      const func: RenderParam = {}

      const declaration = path.node.declaration

      if (t.isFunctionDeclaration(declaration) || t.isArrowFunctionExpression(declaration)) {
        const functionName = getFunctionHandlerName({
          sourceFilePath: resourcePath,
          isExportDefault: true,
          functionName: getFunctionName(path),
        })
        const { method, params } = parseFunctionParams(declaration.params)
        func.method = method
        func.functionId = getFunctionName(path)
        func.isExportDefault = true
        func.url = helper.getHTTPPath(resourcePath, functionName, true)
        func.meta = {
          functionName,
          unstable_params: params,
        }

        funcs.push(func)
      } else {
        err = buildCodeFrameError(path, getErrorMessage())
        path.stop()
      }
    },
  })

  if (err) {
    callback(err)
    return
  }

  const code = buildRequest(funcs, this.rootContext, this.query)
  debug('compile %s', resourcePath)
  callback(null, code)
}

function getFunctionName(path: NodePath<t.ExportDefaultDeclaration>) {
  const declaration = path.node.declaration
  const defaultExportName = '$default'

  if (t.isFunctionDeclaration(declaration)) {
    return declaration?.id?.name || defaultExportName
  }

  return defaultExportName
}

function parseFunctionParams(params: FunctionDeclaration['params']) {
  const keys = []

  for (const param of params) {
    // (a) => {}
    if (t.isIdentifier(param)) {
      keys.push(param.name)
      continue
    }

    //  (a = 1) => {}
    if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
      keys.push(param.left.name)
      continue
    }

    // (...a) => {}
    if (t.isRestElement(param) && t.isIdentifier(param.argument)) {
      keys.push(param.argument.name)
      continue
    }

    console.log('Function parameter parsing error, node type: %s', param.type)
  }

  return {
    method: params?.length > 0 ? 'POST' : ('GET' as LambdaHTTPMethod),
    params: keys,
  }
}

function getHTTPMethod(params: FunctionDeclaration['params']): LambdaHTTPMethod {
  const method = params?.length > 0 ? 'POST' : 'GET'
  return method
}

function getErrorMessage() {
  return `
    When a function file is used as an API, only the following export methods are allowed
      1. export async function demo () {}
      2. export const demo = async function () {}
      3. export const demo = async () => {}
      4. export default async function demo () {}
      5. export default async function () {}
      6. export default async () => {}
  `
}

function buildCodeFrameError(path: NodePath<any>, message: string) {
  const root = path.findParent((p) => !p.parentPath)
  const frame = codeFrameColumns(root.toString(), path.node.loc, {
    highlightCode: true,
    message: message,
  })

  return new Error(frame)
}
