import { Serve } from '@midwayjs/serve';

/**
 * Serve html in production mode
 */
const Handler =
  process.env.NODE_ENV !== 'development' && Serve('/*', { dir: 'build' });

export default Handler;
