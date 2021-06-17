'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const koa_bodyparser_1 = __importDefault(require('koa-bodyparser'))
const hooks_1 = require('@midwayjs/hooks')
exports.default = hooks_1.createConfiguration({
  imports: [
    hooks_1.hooks({
      middleware: [koa_bodyparser_1.default()],
    }),
  ],
})
//# sourceMappingURL=configuration.js.map
