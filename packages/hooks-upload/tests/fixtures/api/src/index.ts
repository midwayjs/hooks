import { Api } from '@midwayjs/hooks'
import { Upload, useFiles, useFields } from '../../../../src'

export const fields = Api(Upload('/fields'), async () => {
  const fields = useFields()
  const files = useFiles()
  return { fields, files }
})

export default Api(Upload('/upload'), async () => {
  const files = useFiles()
  return files
})
