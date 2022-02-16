import { Api, Get } from '@midwayjs/hooks';

export default Api(Get(), async () => {
  return {
    date: new Date(),
  };
});
