import { ts } from '@midwayjs/mwcc'
import { helper } from '../helper'
import {
  closetAncestor,
  getSourceFilePath,
  hasModifier,
  isHOCExportAssignment,
  isLambdaOrHookVariableStatement,
} from '../util'
import { DefaultKeyword } from '../const'

export default {
  transform() {
    return {
      /**
       * export default () => {}
       * =>
       * export default async function $default () {}
       */
      ExportAssignment(node: ts.ExportAssignment) {
        if (!helper.isLambdaFile(getSourceFilePath(node))) {
          return node
        }

        const expression = node.expression

        if (ts.isArrowFunction(expression)) {
          return ts.factory.createFunctionDeclaration(
            expression.decorators,
            [
              ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
              ts.factory.createModifier(ts.SyntaxKind.DefaultKeyword),
              ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword),
            ],
            expression.asteriskToken,
            ts.factory.createIdentifier(DefaultKeyword),
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

        return ts.factory.updateFunctionDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.asteriskToken,
          ts.factory.createIdentifier(DefaultKeyword),
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
        let name = ''

        if (isLambdaOrHookVariableStatement(node)) {
          name = closetAncestor<ts.VariableDeclaration>(node, ts.SyntaxKind.VariableDeclaration).name.getText()
        } else if (isHOCExportAssignment(node)) {
          name = DefaultKeyword
        }

        if (name) {
          const body = ts.isBlock(node.body)
            ? node.body
            : ts.factory.createBlock([ts.factory.createReturnStatement(node.body)])
          return ts.factory.createFunctionExpression(
            node.modifiers,
            node.asteriskToken,
            ts.factory.createIdentifier(name),
            node.typeParameters,
            node.parameters,
            node.type,
            body
          )
        }

        return node
      },
    }
  },
}
