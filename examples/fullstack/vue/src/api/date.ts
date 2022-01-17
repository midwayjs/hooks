import { Api, Get } from '@midwayjs/hooks';

export const getDate = Api(Get(), async () => {
  return new Date().toString();
});
