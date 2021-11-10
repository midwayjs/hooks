import { IPlugin } from '@alib/build-scripts'
import { HooksWebpackPlugin } from '@midwayjs/unplugin-hooks'

const buildHooksRequest: IPlugin = (pluginApi) => {
  pluginApi.onGetWebpackConfig((config) => {
    config.plugin('@midwayjs/hooks').use(HooksWebpackPlugin())
  })
}

export default buildHooksRequest
