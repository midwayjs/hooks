import { hooks, createConfiguration } from '@midwayjs/hooks';
import bodyParser from 'koa-bodyparser';
import { createLogger } from './middleware';

export default createConfiguration({
  imports: [
    hooks({
      // Global Middleware
      middleware: [bodyParser(), createLogger('Global')],
    }),
  ],
});
