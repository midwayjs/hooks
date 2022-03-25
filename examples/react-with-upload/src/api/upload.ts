import { Api } from '@midwayjs/hooks';
import { Upload, useFiles } from '@midwayjs/hooks-upload';

export default Api(Upload('/api/upload'), async () => {
  const files = useFiles();
  return files;
});
