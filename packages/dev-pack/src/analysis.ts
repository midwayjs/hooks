// fork from https://github.com/midwayjs/cli/blob/e4734e2e0d27f97e6780748bc58f27ca8955102e/packages/cli-plugin-dev/src/utils.ts#L6-L34
export const analysisDecorator = async (cwd: string) => {
  const { WebRouterCollector } = require('@midwayjs/core')
  const collector = new WebRouterCollector(cwd, {
    includeFunctionRouter: true,
  })
  const result = await collector.getFlattenRouterTable()
  const allFunc = {}
  if (Array.isArray(result)) {
    result.forEach((func) => {
      let method = [].concat(func.requestMethod || 'get')
      if (method.includes('all')) {
        method = []
      }
      allFunc[func.funcHandlerName] = {
        handler: func.funcHandlerName,
        events: [
          {
            http: {
              method,
              path: (func.prefix + func.url).replace(/\/{1,}/g, '/'),
            },
          },
        ],
      }
    })
  }
  return allFunc
}
