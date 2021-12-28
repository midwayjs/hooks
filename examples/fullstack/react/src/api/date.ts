import { Decorate, Get } from '@midwayjs/hooks';

export const getDate = Decorate(Get(), async () => {
  return new Date().toLocaleString();
});
