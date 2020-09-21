import { IPlugin } from '@alib/build-scripts'

const buildHooksRequest: IPlugin = (pluginApi) => {
  pluginApi.onGetWebpackConfig((config) => {
    const MidwayHooksLoader = require.resolve('@midwayjs/hooks-loader')
    ;['jsx', 'tsx'].forEach((type) => {
      config.module.rule(type).use('midway-hooks').loader(MidwayHooksLoader)
    })
  })
}

export default buildHooksRequest
