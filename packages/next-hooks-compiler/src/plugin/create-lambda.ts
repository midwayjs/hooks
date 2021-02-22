import { ts } from '@midwayjs/mwcc'
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
} from '../util'
import { FunctionHandler, HooksRequestContext } from '../const'
import { router } from '../helper'
import { addRoute } from '../routes'
import { MidwayHooksFunctionStructure } from '@midwayjs/hooks-shared'
import { relative, toUnix } from 'upath'
import _ from 'lodash'
import { getFunctionId } from '@midwayjs/hooks-router'

export default {
  transform() {
    return {
      FunctionDeclaration(node: ts.FunctionDeclaration) {
        if (!isLambdaOrHook(getTopLevelNode(node), node)) {
          return node
        }

        if (isLambda(node, node)) {
          const functionName = getTopLevelNameNode(node).text
          const isExportDefault = hasModifier(
            node,
            ts.ModifierFlags.ExportDefault
          )

          addRoute(
            getSourceFilePath(node),
            parseFunctionConfig(node, functionName, isExportDefault)
          )
        }

        return ts.factory.updateFunctionDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.asteriskToken,
          node.name,
          node.typeParameters,
          node.parameters,
          node.type,
          router.isAsyncHooksRuntime
            ? node.body
            : createLambdaContext(node.body)
        )
      },
      FunctionExpression(node: ts.FunctionExpression) {
        const isHOC = isHOCExportAssignment(node)
        const isVariableStatement = isLambdaOrHookVariableStatement(node)

        if (!isHOC && !isVariableStatement) {
          return node
        }

        const statement = isHOC
          ? closetAncestor<ts.ExportAssignment>(
              node,
              ts.SyntaxKind.ExportAssignment
            )
          : closetAncestor<ts.VariableStatement>(
              node,
              ts.SyntaxKind.VariableStatement
            )

        if (isLambda(node, statement)) {
          const functionName = isHOC ? '' : getTopLevelNameNode(statement).text
          const isExportDefault = isHOC
            ? true
            : hasModifier(node, ts.ModifierFlags.ExportDefault) ||
              hasModifier(statement, ts.ModifierFlags.ExportDefault)

          addRoute(
            getSourceFilePath(node),
            parseFunctionConfig(node, functionName, isExportDefault)
          )
        }

        return ts.factory.updateFunctionExpression(
          node,
          node.modifiers,
          node.asteriskToken,
          node.name,
          node.typeParameters,
          node.parameters,
          node.type,
          router.isAsyncHooksRuntime
            ? node.body
            : createLambdaContext(node.body)
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
  const { events } = router.getRuleBySourceFilePath(sourceFilePath)
  const url = router.getHTTPPath(sourceFilePath, functionName, isExportDefault)
  const deployName = getFunctionId({
    router,
    sourceFilePath,
    functionName,
    isExportDefault,
  })

  return {
    deployName,
    isFunctional: true,
    exportFunction: isExportDefault ? '' : functionName,
    sourceFile: toUnix(relative(router.root, sourceFilePath)),
    sourceFilePath: toUnix(router.getDistPath(sourceFilePath)),
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

// 添加 const $lambda = this
function createLambdaContext(block: ts.Block) {
  if (!block) {
    return block
  }

  const expr = ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(HooksRequestContext),
          undefined,
          undefined,
          ts.factory.createThis()
        ),
      ],
      ts.NodeFlags.Const
    )
  )

  const statements = [expr, ...block.statements]
  return ts.factory.createBlock(statements)
}
