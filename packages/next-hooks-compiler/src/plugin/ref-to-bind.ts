import ts from 'typescript'
import { template, TransformationContext } from '@midwayjs/mwcc'
import { BuiltinHOC, BuiltinHooks, ContextBind, HooksMethodNamespace, MidwayHooksPackage } from '../const'
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
  tryCatch,
} from '../util'
import { helper } from '../helper'
import { InvalidReferenceError } from '../errors/InvalidReference'
import { dirname, resolve } from 'upath'

export default {
  transform(ctx: TransformationContext) {
    return {
      Identifier(node: ts.Identifier) {
        if (
          // import HOOKS from 'xxx'
          closetAncestor(node, ts.SyntaxKind.ImportDeclaration) ||
          // const { HOOKS: b } = obj
          closetAncestor(node, ts.SyntaxKind.BindingElement) ||
          // const a = call<HOOKS>()
          closetAncestor(node, ts.SyntaxKind.TypeReference)
        ) {
          return node
        }

        const { value: declarations, error } = resolveDeclarations(ctx, node)
        if (error) {
          return node
        }

        if (!isEmpty(declarations) && ts.isBindingElement(declarations[0])) {
          return node
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

/**
 * resolveDeclarations will crash on export * from 'xxx' case
 * issue: https://github.com/microsoft/TypeScript/issues/40513
 */
function resolveDeclarations(ctx: TransformationContext, node: ts.Node) {
  let count = 2
  let lastError = null
  while (count--) {
    const { value, error } = tryCatch(() => ctx.resolveDeclarations(node))
    if (value) {
      return { value, error: false }
    }

    debug(
      'ctx.resolveDeclarations. Error: %s, Identifier: %s, Path: %s, Error Stack: %s',
      error?.message,
      node.getText(),
      getSourceFilePath(node),
      error?.stack
    )
    lastError = error
  }
  console.error(
    [
      '[Known Issue] ctx.resolveDeclarations Error: %s, Identifier: %s, Path: %s.',
      `Quick fix: stop using like export * from 'mod' from your code`,
      'Relative Issue: https://github.com/microsoft/TypeScript/issues/40513',
      'You can submit issue to https://github.com/midwayjs/hooks/issues/new',
      'Error Stack: %s',
    ].join('\n'),
    lastError?.message,
    node.getText(),
    getSourceFilePath(node),
    lastError?.stack
  )
  return { value: null, error: true }
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
 */
function compileRefToBind(identifier: ts.Identifier) {
  const tpl = template(`HOOK.${ContextBind}`)({ HOOK: identifier })[0] as ts.ExpressionStatement
  return tpl.expression
}

/**
 * 应对 Import 进来不一定是函数的情况
 * useQuery => typeof useQuery === 'function' ? useQuery.bind($lambda) : useQuery
 */
function compileImportRefToBind(identifier: ts.Identifier) {
  const tpl = template(`typeof HOOK === 'function' ? HOOK.${ContextBind} : HOOK`)({
    HOOK: identifier,
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

  const tpl = template(`${HooksMethodNamespace}.HOOK`)({ HOOK: identifier })[0] as ts.ExpressionStatement
  return tpl.expression
}
