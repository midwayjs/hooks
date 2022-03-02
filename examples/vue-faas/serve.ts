import { Serve } from '@midwayjs/serve';

/**
 * Serve html in production mode
 */
const Handler =
  process.env.NODE_ENV === 'production' && Serve('/*', { dir: 'build' });

export default Handler;
