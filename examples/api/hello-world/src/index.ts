import { Decorate, Get, useContext } from '@midwayjs/hooks';
import { Context } from '@midwayjs/koa';

export default Decorate(Get('/'), async () => {
  const ctx = useContext<Context>();
  return {
    message: 'Hello World!',
    ip: ctx.ip,
  };
});
