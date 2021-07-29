import type { ApiBaseParam } from '@midwayjs/hooks-core'
import { isWeChatMiniProgram } from '@uni/env'

export const request = async (param: ApiBaseParam) => {
  if (isWeChatMiniProgram) {
    const { result } = await wx.cloud.callFunction({
      name: param.functionId,
      data: param.data,
    })
    return result
  }
  throw new Error('current miniprogram is not support')
}
