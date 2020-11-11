import ts from 'typescript'
import {
  closetAncestor,
  getSourceFilePath,
  getTopLevelNameNode,
  getTopLevelNode,
  hasModifier,
  isHOCExportAssignment,
  isLambda,
  isLambdaOrHook,
  isLambdaOrHookVariableStatement,
  removeExtension,
} from '../util'
import { FunctionHandler, HooksRequestContext } from '../const'
import { helper } from '../helper'
import { addRoute, MidwayHooksFunctionStructure } from '../routes'
import { relative, toUnix } from 'upath'
import _ from 'lodash'

export default {
  transform() {
    return {
      FunctionDeclaration(node: ts.FunctionDeclaration) {
        if (!isLambdaOrHook(getTopLevelNode(node), node)) {
          return node
        }

        if (isLambda(node, node)) {
          const functionName = getTopLevelNameNode(node).text
          const isExportDefault = hasModifier(node, ts.ModifierFlags.ExportDefault)

          addRoute(getSourceFilePath(node), parseFunctionConfig(node, functionName, isExportDefault))
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
        const isHOC = isHOCExportAssignment(node)
        const isVariableStatement = isLambdaOrHookVariableStatement(node)

        if (!isHOC && !isVariableStatement) {
          return node
        }

        const statement = isHOC
          ? closetAncestor<ts.ExportAssignment>(node, ts.SyntaxKind.ExportAssignment)
          : closetAncestor<ts.VariableStatement>(node, ts.SyntaxKind.VariableStatement)

        if (isLambda(node, statement)) {
          const functionName = isHOC ? '' : getTopLevelNameNode(statement).text
          const isExportDefault = isHOC
            ? true
            : hasModifier(node, ts.ModifierFlags.ExportDefault) ||
              hasModifier(statement, ts.ModifierFlags.ExportDefault)

          addRoute(getSourceFilePath(node), parseFunctionConfig(node, functionName, isExportDefault))
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
  functionName: string,
  isExportDefault: boolean
): MidwayHooksFunctionStructure {
  const sourceFilePath = getSourceFilePath(node)
  const { events } = helper.getRuleBySourceFilePath(sourceFilePath)
  const url = helper.getHTTPPath(sourceFilePath, functionName, isExportDefault)
  const deployName = getDeployFunctionName({ sourceFilePath, functionName, isExportDefault })

  return {
    deployName,
    isFunctional: true,
    exportFunction: isExportDefault ? '' : functionName,
    sourceFile: toUnix(relative(helper.root, sourceFilePath)),
    sourceFilePath: toUnix(helper.getDistPath(sourceFilePath)),
    handler: `${deployName}.${FunctionHandler}`,
    gatewayConfig: {
      url,
      method: node.parameters.length > 0 ? 'POST' : 'GET',
      meta: {
        functionName: deployName,
      },
    },
    event: events,
  }
}

export function getDeployFunctionName(config: {
  sourceFilePath: string
  functionName: string
  isExportDefault: boolean
}) {
  const { sourceFilePath, functionName, isExportDefault } = config

  const rule = helper.getRuleBySourceFilePath(sourceFilePath)
  const lambdaDirectory = helper.getLambdaDirectory(rule)

  // 多个 source 的情况下，根据各自的 lambdaDirectory 来增加前缀命名
  const relativeDirectory = helper.functionsRule.rules.length > 1 ? helper.source : lambdaDirectory
  const relativePath = relative(relativeDirectory, sourceFilePath)
  // a/b/c -> a-b-c
  const id = _.kebabCase(removeExtension(relativePath))
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
      [ts.createVariableDeclaration(ts.createIdentifier(HooksRequestContext), undefined, ts.createThis())],
      ts.NodeFlags.Const
    )
  )

  const statements = [expr, ...block.statements]
  return ts.createBlock(statements)
}
