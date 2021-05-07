import { superjson } from '@midwayjs/hooks';

export class UserExistError extends Error {}

export class UserNotFoundError extends Error {}

export class ValidationError extends Error {
  key: string;
  expect: string;
  received: any;

  constructor(key: string, expect: string, received: any) {
    super();
    this.key = key;
    this.expect = expect;
    this.received = received || undefined;
  }
}

superjson.registerClass(UserExistError, 'UserExistError');
superjson.registerClass(UserNotFoundError, 'UserNotFoundError');
superjson.registerClass(ValidationError, {
  identifier: 'ValidationError',
  allowProps: ['key', 'expect', 'received'],
});
