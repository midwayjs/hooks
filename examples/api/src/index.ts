import { Api, Get, useContext } from '@midwayjs/hooks';
import type { Context } from '@midwayjs/koa';

export default Api(Get('/'), async () => {
  const ctx = useContext<Context>();
  return {
    message: 'Hello World!',
    ip: ctx.ip,
  };
});
