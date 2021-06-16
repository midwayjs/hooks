import bodyParser from 'koa-bodyparser';
import { hooks, createConfiguration } from '@midwayjs/hooks';
import { createLogger } from './middleware';

export default createConfiguration({
  imports: [
    hooks({
      middleware: [bodyParser(), createLogger('Global')],
    }),
  ],
});
