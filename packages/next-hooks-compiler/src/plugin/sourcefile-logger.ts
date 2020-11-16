import ts from 'typescript'
import { debug, getSourceFilePath } from '../util'
import { helper } from '../helper'
import { relative } from 'upath'

export default {
  transform() {
    return {
      SourceFile(node: ts.SourceFile) {
        const sourceFilePath = getSourceFilePath(node)

        debug('SourceFile %s', relative(helper.source, sourceFilePath))
        return node
      },
    }
  },
}
