import { getRouter, getSource, setProjectRoot } from '@midwayjs/hooks-internal'
import { GenerateTarget, getEntryCode } from './midway'

export async function getPreloadCode(cwd: string) {
  setProjectRoot(cwd)

  const source = getSource({ useSourceFile: false })
  const router = getRouter(source)

  return `
    ${getEntryCode(source, router, GenerateTarget.JS)}
    module.exports = require('./configuration');
  `
}
