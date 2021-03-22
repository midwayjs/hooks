import { superjson } from '@midwayjs/hooks';

export class AuthError extends Error {
  name = 'AuthError';

  key: string;
  constructor(key: string) {
    super();
    this.key = key;
  }
}

superjson.allowErrorProps('key');
superjson.registerClass(AuthError, 'AuthError');
