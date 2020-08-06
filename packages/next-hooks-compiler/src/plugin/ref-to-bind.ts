import ts from 'typescript'
import { TransformationContext, template } from '@midwayjs/mwcc'
import { MidwayHooksPackage, HooksMethodNamespace, BuiltinHooks, ContextBind } from '../const'
import { BuiltinHooksError } from '../errors/BuiltinHooks'
import { isEmpty } from 'lodash'
import {
  isHookName,
  closetAncestor,
  getSourceFilePath,
  isLambdaOrHook,
  isAncestor,
  getTopLevelNode,
  isInsideLambdaOrHook,
} from '../util'
import { helper } from '../helper'
import { InvalidReferenceError } from '../errors/InvalidReference'
import { debug } from '../util'

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

  if (isLambdaOrHook(getTopLevelNode(declaration), declaration) && !isAncestor(node, declaration)) {
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
    return compileBuiltinHooks(node)
  } else {
    return compileRefToBind(node)
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
  return closetAncestor(definition, ts.SyntaxKind.ImportDeclaration) && isHookName(node.getText())
}

/**
 * useQuery => useQuery.bind($lambda)
 */
function compileRefToBind(identifier: ts.Identifier) {
  const tpl = template(`HOOK.${ContextBind}`)({ HOOK: identifier })[0] as ts.ExpressionStatement
  return tpl.expression
}

/**
 * useContext => $lambda.ctx.hooks.useContext
 */
function compileBuiltinHooks(identifier: ts.Identifier) {
  const hook = identifier.getText()

  if (!BuiltinHooks.includes(hook)) {
    throw new BuiltinHooksError(identifier)
  }

  const tpl = template(`${HooksMethodNamespace}.HOOK`)({ HOOK: identifier })[0] as ts.ExpressionStatement
  return tpl.expression
}
