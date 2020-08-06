import ts, { FunctionDeclaration, ArrowFunction, FunctionExpression } from 'typescript'
import { helper } from './helper'
import createDebug from 'debug'

export const debug = createDebug('hooks: next-compiler')

export function getTopLevelNode(node: ts.Node) {
  if (ts.isExportAssignment(node)) {
    return node.expression
  }

  if (ts.isVariableStatement(node)) {
    return node.declarationList.declarations[0].initializer
  }

  if (ts.isVariableDeclaration(node)) {
    return node.initializer
  }

  return node
}

export function isHookName(s: string) {
  return /^use[A-Z0-9].*$/.test(s)
}

export function isInsideLambdaOrHook(node: ts.Node) {
  const topLevelParent = closetAncestorWhileKind(
    node,
    (kind, currentNode) => currentNode.parent.kind === ts.SyntaxKind.SourceFile
  )

  const topLevelNode = getTopLevelNode(topLevelParent)
  return isLambdaOrHook(topLevelNode, topLevelParent)
}

export function isLambdaOrHook(node: ts.Node, container: ts.Node) {
  if (!node) {
    return false
  }
  // 函数
  if (isFunctionKind(node.kind)) {
    const funcName = getTopLevelNameNode(container)?.getText?.() ?? ''
    // 自定义 Hook
    return isHookName(funcName) || isLambda(node as FunctionDeclaration, container)
  }

  return false
}

export function isLambda(node: ts.FunctionDeclaration | ts.FunctionExpression, container: ts.Node) {
  return helper.isLambdaFile(getSourceFilePath(node)) && isExported(node, container)
}

export function isExported(node: ts.FunctionDeclaration | ts.FunctionExpression, container: any) {
  if (ts.isExportAssignment(node) || ts.isExportAssignment(container)) {
    return true
  }

  if (hasModifier(node, ts.ModifierFlags.None)) {
    node = container
  }

  if (hasModifier(node, ts.ModifierFlags.ExportDefault) || hasModifier(node, ts.ModifierFlags.Export)) {
    return true
  }

  return false
}

export function hasModifier(node: any, modifier: ts.ModifierFlags) {
  return (ts.getCombinedModifierFlags(node) & modifier) === modifier
}

export function getTopLevelNameNode(node: ts.Node): ts.Identifier {
  // export const func = () => {}
  if (ts.isVariableStatement(node)) {
    const declaration = node.declarationList.declarations[0]
    // func
    return declaration.name as ts.Identifier
  }

  // const useDemo = () => {}
  if (ts.isVariableDeclaration(node)) {
    return node.name as ts.Identifier
  }

  if (ts.isFunctionDeclaration(node)) {
    return node.name
  }

  console.log('getTopLevelNameNode 不支持的类型 ' + ts.SyntaxKind[node.kind])
  return ts.createIdentifier('')
}

export function isFunctionKind(kind: ts.SyntaxKind) {
  return (
    kind === ts.SyntaxKind.FunctionDeclaration ||
    kind === ts.SyntaxKind.FunctionExpression ||
    kind === ts.SyntaxKind.ArrowFunction
  )
}

export type FunctionKind = FunctionDeclaration | ArrowFunction | FunctionExpression

export function closetAncestor<T extends ts.Node = ts.Node>(node: ts.Node, kind: ts.SyntaxKind): T {
  return closetAncestorWhileKind(node, (currentKind) => currentKind === kind) as T
}

export function closetAncestorWhileKind(
  node: ts.Node,
  condition: (kind: ts.SyntaxKind, currentNode?: ts.Node) => boolean
) {
  let parent = node.parent
  while (parent != null) {
    if (condition(parent.kind, parent)) {
      return parent
    }
    parent = parent.parent
  }
  return undefined
}

export function isAncestor(node: ts.Node, ancestor: ts.Node) {
  if (node === ancestor) {
    return true
  }

  while (node !== ancestor && node) {
    node = node.parent

    if (node === ancestor) {
      return true
    }
  }

  return false
}

export function isLambdaOrHookVariableStatement(node: FunctionKind) {
  const variableStatement = closetAncestor<ts.VariableStatement>(node, ts.SyntaxKind.VariableStatement)

  if (!variableStatement) {
    return false
  }

  return isLambdaOrHook(node, variableStatement)
}

export function getVariableStatementIdentifier(node: ts.VariableStatement) {
  return node.declarationList.declarations[0].name
}

export function getSourceFilePath(node: ts.Node) {
  return node.getSourceFile().fileName
}
