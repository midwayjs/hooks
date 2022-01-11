import { extname, relative, resolve, sep } from 'upath'

export abstract class AbstractRouter {
  abstract isApiFile(options: { file: string; mod?: any }): boolean

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

  isSourceFile(file: string, source: string) {
    return this.isJavaScriptFile(file) && this.isPathInside(file, source)
  }

  protected isPathInside(child: string, parent: string) {
    const relation = relative(parent, child)
    return Boolean(
      relation &&
        relation !== '..' &&
        !relation.startsWith(`..${sep}`) &&
        relation !== resolve(child)
    )
  }

  protected isJavaScriptFile(file: string) {
    const extensions = ['.ts', '.js', '.mjs']
    if (!extensions.includes(extname(file))) {
      return false
    }

    const testExt = ['.test.ts', '.test.js', '.test.mjs']

    if (testExt.some((ext) => file.endsWith(ext))) {
      return false
    }

    return !file.includes('_client')
  }
}
