import { ts } from '@midwayjs/mwcc'
import { debug, getSourceFilePath } from '../util'
import { router } from '../helper'
import { relative } from 'upath'

export default {
  transform() {
    return {
      SourceFile(node: ts.SourceFile) {
        const sourceFilePath = getSourceFilePath(node)
        debug('SourceFile %s', relative(router.source, sourceFilePath))
        return node
      },
    }
  },
}
