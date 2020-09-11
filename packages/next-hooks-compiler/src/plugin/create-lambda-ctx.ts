import ts from 'typescript'
import {
  isLambdaOrHook,
  getTopLevelNode,
  isLambdaOrHookVariableStatement,
  isLambda,
  getTopLevelNameNode,
  getSourceFilePath,
  hasModifier,
  closetAncestor,
} from '../util'
import { MidwayHookContext, FunctionHandler } from '../const'
import { helper } from '../helper'
import { addRoute, MidwayHooksFunctionStructure } from './routes'
import { relative, extname } from 'upath'
import { TransformationContext } from '@midwayjs/mwcc'

export default {
  transform(ctx: TransformationContext) {
    return {
      FunctionDeclaration(node: ts.FunctionDeclaration) {
        if (!isLambdaOrHook(getTopLevelNode(node), node)) {
          return node
        }

        if (isLambda(node, node)) {
          addRoute(getSourceFilePath(node), parseFunctionConfig(node, node))
        }

        return ts.updateFunctionDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.asteriskToken,
          node.name,
          node.typeParameters,
          node.parameters,
          node.type,
          createLambdaContext(node.body)
        )
      },
      FunctionExpression(node: ts.FunctionExpression) {
        if (!isLambdaOrHookVariableStatement(node)) {
          return node
        }

        const statement = closetAncestor<ts.VariableStatement>(node, ts.SyntaxKind.VariableStatement)
        if (isLambda(node, statement)) {
          addRoute(getSourceFilePath(node), parseFunctionConfig(node, statement))
        }

        return ts.updateFunctionExpression(
          node,
          node.modifiers,
          node.asteriskToken,
          node.name,
          node.typeParameters,
          node.parameters,
          node.type,
          createLambdaContext(node.body)
        )
      },
    }
  },
}

function parseFunctionConfig(
  node: ts.FunctionDeclaration | ts.FunctionExpression,
  container: ts.Node
): MidwayHooksFunctionStructure {
  const sourceFilePath = getSourceFilePath(node)
  const functionIdentifier = getTopLevelNameNode(container)
  const functionName: string = functionIdentifier.text
  const isExportDefault =
    hasModifier(node, ts.ModifierFlags.ExportDefault) || hasModifier(container, ts.ModifierFlags.ExportDefault)

  const url = helper.getHTTPPath(sourceFilePath, functionName, isExportDefault)
  const id = getFunctionHandlerName({ sourceFilePath, functionName, isExportDefault })

  return {
    isFunctional: true,
    argsPath: '',
    exportFunction: isExportDefault ? '' : functionName,
    sourceFilePath: helper.getDistPath(sourceFilePath),
    handler: `${id}.${FunctionHandler}`,
    gatewayConfig: {
      handler: id,
      url,
      method: node.parameters.length > 0 ? 'POST' : 'GET',
      meta: {
        functionName,
      },
    },
  }
}

export function getFunctionHandlerName(config: {
  sourceFilePath: string
  functionName: string
  isExportDefault: boolean
}) {
  const { sourceFilePath, functionName, isExportDefault } = config
  const relativePath = relative(helper.getLambdaDirectory(sourceFilePath), sourceFilePath)
  const id = relativePath.replace(extname(sourceFilePath), '').replace(/\//g, '-')
  const name = [id, isExportDefault ? '' : `-${functionName}`].join('')

  return name.toLowerCase()
}

// 添加 const $lambda = this
function createLambdaContext(block: ts.Block) {
  if (!block) {
    return block
  }

  const expr = ts.createVariableStatement(
    undefined,
    ts.createVariableDeclarationList(
      [ts.createVariableDeclaration(ts.createIdentifier(MidwayHookContext), undefined, ts.createThis())],
      ts.NodeFlags.Const
    )
  )

  const statements = [expr, ...block.statements]
  return ts.createBlock(statements)
}
