import ts from 'typescript'
import { template } from '@midwayjs/mwcc'
import { MidwayHooksPackage } from '../const'

export default {
  transform() {
    return {
      SourceFile(node: ts.SourceFile) {
        return ts.updateSourceFileNode(
          node,
          [createRuntimeHelper(), ...node.statements],
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

function createRuntimeHelper() {
  const expr = template(`import { bind as _bind, call as _call } from '${MidwayHooksPackage}/lib/runtime'`)(
    {}
  )[0] as ts.ExpressionStatement
  return expr
}
