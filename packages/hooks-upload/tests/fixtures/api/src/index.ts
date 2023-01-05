import { Api } from '@midwayjs/hooks'
import { Upload, useFields, useFiles } from '../../../../src'

export const fields = Api(Upload('/fields'), async () => {
  const fields = useFields()
  const files = useFiles()
  return { fields, files }
})

export default Api(Upload('/upload'), async () => {
  const files = useFiles()
  return files
})
