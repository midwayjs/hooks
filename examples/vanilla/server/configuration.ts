import bodyParser from 'koa-bodyparser';
import { hooks, createConfiguration } from '@midwayjs/hooks';

export default createConfiguration({
  imports: [
    hooks({
      middleware: [bodyParser()],
    }),
  ],
});
