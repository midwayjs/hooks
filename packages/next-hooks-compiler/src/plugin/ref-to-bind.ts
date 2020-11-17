import ts from 'typescript'
import { template, TransformationContext } from '@midwayjs/mwcc'
import { BuiltinHOC, BuiltinHooks, HooksRequestContext, MidwayHooksPackage } from '../const'
import { BuiltinHooksError } from '../errors/BuiltinHooks'
import { isEmpty } from 'lodash'
import {
  closetAncestor,
  debug,
  getSourceFilePath,
  getTopLevelNode,
  isInBlock,
  isHookName,
  isInsideLambdaOrHook,
  isLambdaOrHook,
} from '../util'
import { helper } from '../helper'
import { InvalidReferenceError } from '../errors/InvalidReference'
import { dirname, resolve } from 'upath'
import { createRuntimeAccess, runtimeMap } from './runtime-helper'

export default {
  transform(ctx: TransformationContext) {
    return {
      Identifier(node: ts.Identifier) {
        if (
          closetAncestor(node, ts.SyntaxKind.ImportDeclaration) ||
          closetAncestor(node, ts.SyntaxKind.BindingElement)
        ) {
          return node
        }

        let declarations: ts.Node[]
        try {
          declarations = ctx.resolveDeclarations(node)
        } catch (error) {
          debug('ctx.resolveDeclarations. Error: %s, Identifier: %s', error.message, node.getText())
          return node
        }

        if (!isEmpty(declarations)) {
          if (ts.isBindingElement(declarations[0])) {
            return node
          }
        }

        const importNames = ctx.resolveImportedNames(node)

        if (isEmpty(importNames)) {
          return processReference(node, ctx)
        }

        const [{ moduleId }] = importNames
        return processImportNames(node, moduleId, ctx)
      },
    }
  },
}

function processReference(node: ts.Identifier, ctx: TransformationContext) {
  const isRef = isHookName(node.text) || helper.isLambdaFile(getSourceFilePath(node))

  if (!isRef) {
    return node
  }

  const declarations = ctx
    .resolveDeclarations(node)
    .filter((declaration) => helper.isProjectFile(getSourceFilePath(declaration)))

  if (isEmpty(declarations)) {
    return node
  }

  const [declaration] = declarations

  if (isLambdaOrHook(getTopLevelNode(declaration), declaration) && isInBlock(node)) {
    if (!isInsideLambdaOrHook(node)) {
      throw new InvalidReferenceError(node)
    }

    return compileRefToBind(node)
  }

  return node
}

function processImportNames(node: ts.Identifier, moduleId: string, ctx: TransformationContext) {
  if (!isLambdaOrHookImports(node, moduleId, ctx)) {
    return node
  }

  if (!isInsideLambdaOrHook(node)) {
    throw new InvalidReferenceError(node)
  }

  // 不处理 Type 引用
  if (closetAncestor(node, ts.SyntaxKind.TypeQuery) || closetAncestor(node, ts.SyntaxKind.TypeReference)) {
    return node
  }

  if (moduleId === MidwayHooksPackage) {
    return compileBuiltinMethod(node)
  } else {
    return compileImportRefToBind(node)
  }
}

function isLambdaOrHookImports(node: ts.Identifier, moduleId: string, ctx: TransformationContext) {
  // lodash
  if (!moduleId.startsWith('.')) {
    // @midwayjs/hooks 内置 Hooks
    if (moduleId === MidwayHooksPackage) {
      // 忽略 @MidwayHooks 装饰器
      return true
    }

    return false
  }

  const declarations = ctx.resolveDeclarations(node)
  if (isEmpty(declarations)) {
    return false
  }

  const [definition] = declarations
  if (!closetAncestor(definition, ts.SyntaxKind.ImportDeclaration)) {
    return false
  }

  const moduleFile = resolve(dirname(getSourceFilePath(node)), moduleId)
  return isHookName(node.getText()) || helper.isLambdaFile(moduleFile)
}

/**
 * useQuery => useQuery.bind($lambda)
 * useQuery => _bind(useQuery, $lambda)
 */
function compileRefToBind(identifier: ts.Identifier) {
  const sourceFilePath = getSourceFilePath(identifier)

  const tpl = template(`BIND(HOOK, ${HooksRequestContext})`)({
    HOOK: identifier,
    BIND: createRuntimeAccess(runtimeMap.get(sourceFilePath), 'bind'),
  })[0] as ts.ExpressionStatement
  return tpl.expression
}

/**
 * 应对 Import 进来不一定是函数的情况
 * useQuery => typeof useQuery === 'function' ? useQuery.bind($lambda) : useQuery
 */
function compileImportRefToBind(identifier: ts.Identifier) {
  const sourceFilePath = getSourceFilePath(identifier)

  const tpl = template(`BIND(HOOK, ${HooksRequestContext})`)({
    HOOK: identifier,
    BIND: createRuntimeAccess(runtimeMap.get(sourceFilePath), 'bind'),
  })[0] as ts.ExpressionStatement
  return tpl.expression
}

/**
 * useContext => $lambda.ctx.hooks.useContext
 */
function compileBuiltinMethod(identifier: ts.Identifier) {
  const method = identifier.getText()

  // with 方法不做转换
  if (BuiltinHOC.includes(method)) {
    return identifier
  }

  if (!BuiltinHooks.includes(method)) {
    throw new BuiltinHooksError(identifier)
  }

  const sourceFilePath = getSourceFilePath(identifier)

  const tpl = template(`CALL('${method}', ${HooksRequestContext})`)({
    CALL: createRuntimeAccess(runtimeMap.get(sourceFilePath), 'call'),
  })[0] as ts.ExpressionStatement
  return tpl.expression
}
