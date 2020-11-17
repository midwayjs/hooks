import ts from 'typescript'
import { MidwayHooksPackage } from '../const'
import { getSourceFilePath } from '../util'

export const runtimeMap = new Map<string, ts.ImportDeclaration>()

export default {
  transform() {
    return {
      SourceFile(node: ts.SourceFile) {
        const sourceFilePath = getSourceFilePath(node)
        const helper = createHooksRuntime()

        runtimeMap.set(sourceFilePath, helper)

        return ts.updateSourceFileNode(
          node,
          [helper, ...node.statements],
          node.isDeclarationFile,
          node.referencedFiles,
          node.typeReferenceDirectives,
          node.hasNoDefaultLib,
          node.libReferenceDirectives
        )
      },
    }
  },
}

function createHooksRuntime() {
  return ts.createImportDeclaration(
    [],
    [],
    ts.createImportClause(ts.createTempVariable(undefined), undefined),
    ts.createStringLiteral(`${MidwayHooksPackage}/lib/runtime`)
  )
}

export function createRuntimeAccess(importDeclaration: ts.ImportDeclaration, name: string) {
  return ts.createPropertyAccess(ts.getGeneratedNameForNode(importDeclaration), ts.createIdentifier(name))
}
