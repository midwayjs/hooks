import { codeFrameColumns } from '@babel/code-frame'
import { ts } from '@midwayjs/mwcc'

export const buildErrorCodeFrame = (node: ts.Node, message: string) => {
  const sourceFile = node.getSourceFile()

  const raw = sourceFile.getText()
  const start = sourceFile.getLineAndCharacterOfPosition(node.getStart())
  const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd())

  const frame = codeFrameColumns(
    raw,
    {
      start: {
        line: start.line + 1,
        column: start.character + 1,
      },
      end: {
        line: end.line + 1,
        column: end.character + 1,
      },
    },
    {
      highlightCode: true,
      message,
    }
  )

  return frame
}
