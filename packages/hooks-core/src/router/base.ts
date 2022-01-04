import { extname, relative, resolve, sep } from 'upath'

export abstract class AbstractRouter {
  constructor(public source: string) {}

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

    if (testExt.some((ext) => file.endsWith(ext))) {
      return false
    }

    return !file.includes('_client')
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

  protected isPathInside(child: string, parent: string) {
    const relation = relative(parent, child)
    return Boolean(
      relation &&
        relation !== '..' &&
        !relation.startsWith(`..${sep}`) &&
        relation !== resolve(child)
    )
  }
}
