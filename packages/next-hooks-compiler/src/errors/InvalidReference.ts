import { CompileError } from './Compile'
import ts from 'typescript'

export class InvalidReferenceError extends CompileError {
  constructor(ref: ts.Node) {
    const messages = [
      `只在导出的接口与自定义 Hook 中调用 Hook`,
      `引用变量：${ref.getText()}`,
      `文件地址：${ref.getSourceFile().fileName}`,
      '文档: https://www.yuque.com/midwayjs/faas/qrsykh#pTyCv',
    ]
    super(messages.join('\n'))
    this.name = 'InvalidReferenceError'
  }
}
