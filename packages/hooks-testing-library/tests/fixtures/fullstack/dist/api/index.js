'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.post = exports.get = void 0
const hooks_1 = require('@midwayjs/hooks')
function useKoaContext() {
  return hooks_1.useContext()
}
exports.default = async () => {
  return {
    message: 'Hello World',
    method: useKoaContext().method,
  }
}
const get = async () => {
  return 'get'
}
exports.get = get
const post = async (name) => {
  return { method: 'POST', name }
}
exports.post = post
//# sourceMappingURL=index.js.map
