import { extname } from 'upath'

export abstract class AbstractRouter {
  isJavaScriptFile(file: string) {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs']
    if (!extensions.includes(extname(file))) {
      return false
    }

    const testExt = [
      '.test.ts',
      '.test.tsx',
      '.test.js',
      '.test.jsx',
      '.test.mjs',
    ]
    return !testExt.some((ext) => file.endsWith(ext))
  }

  abstract isApiFile(file: string): boolean

  abstract getFunctionId(
    file: string,
    functionName: string,
    exportDefault: boolean
  ): string

  abstract functionToHttpPath(
    file: string,
    functionName: string,
    isExportDefault: boolean
  ): string
}
