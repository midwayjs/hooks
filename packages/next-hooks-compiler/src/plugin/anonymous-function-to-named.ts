import ts, { ArrowFunction } from 'typescript'
import { helper } from '../helper'
import { hasModifier, isLambdaOrHookVariableStatement, closetAncestor, getSourceFilePath } from '../util'
import { DefaultKeyword } from '../const'

export default {
  transform() {
    return {
      /**
       * export default () => {}
       * =>
       * export default function $default () {}
       */
      ExportAssignment(node: ts.ExportAssignment) {
        if (!helper.isLambdaFile(getSourceFilePath(node))) {
          return node
        }

        const expression = node.expression as ArrowFunction

        if (ts.isArrowFunction(expression)) {
          return ts.createFunctionDeclaration(
            expression.decorators,
            [ts.createModifier(ts.SyntaxKind.ExportKeyword), ts.createModifier(ts.SyntaxKind.DefaultKeyword)],
            expression.asteriskToken,
            ts.createIdentifier(DefaultKeyword),
            expression.typeParameters,
            expression.parameters,
            expression.type,
            expression.body as ts.Block
          )
        }

        return node
      },
      /**
       * export default function () {}
       * =>
       * export default function $default () {}
       */
      FunctionDeclaration(node: ts.FunctionDeclaration) {
        const isExportDefaultAnnoymous =
          helper.isLambdaFile(getSourceFilePath(node)) &&
          ts.isSourceFile(node.parent) &&
          !node.name &&
          hasModifier(node, ts.ModifierFlags.ExportDefault)

        if (!isExportDefaultAnnoymous) {
          return node
        }

        return ts.updateFunctionDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.asteriskToken,
          ts.createIdentifier(DefaultKeyword),
          node.typeParameters,
          node.parameters,
          node.type,
          node.body
        )
      },
      /**
       * 将所有的 lambda & hook 的箭头函数转换为普通函数
       * export const useDemo = () => {}
       * =>
       * export const useDemo = function useDemo () {}
       */
      ArrowFunction(node: ts.ArrowFunction) {
        if (!isLambdaOrHookVariableStatement(node)) {
          return node
        }

        const name = closetAncestor<ts.VariableDeclaration>(node, ts.SyntaxKind.VariableDeclaration).name.getText()
        const body = ts.isBlock(node.body) ? node.body : ts.createBlock([ts.createReturn(node.body)])

        return ts.createFunctionExpression(
          node.modifiers,
          node.asteriskToken,
          ts.createIdentifier(name),
          node.typeParameters,
          node.parameters,
          node.type,
          body
        )
      },
    }
  },
}
