import ts from 'typescript'
import { TransformationContext } from '@midwayjs/mwcc'
import { getSourceFilePath } from '../util'
import { debug } from '../util'
import { helper } from '../helper'
import { relative } from 'upath'

export default {
  transform(ctx: TransformationContext) {
    return {
      SourceFile(node: ts.SourceFile) {
        const sourceFilePath = getSourceFilePath(node)
        debug('SourceFile %s', relative(helper.source, sourceFilePath))
        return node
      },
    }
  },
}
