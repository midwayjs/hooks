import superjson from 'superjson';

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

superjson.registerClass(UserExistError);
superjson.registerClass(UserNotFoundError);
superjson.registerClass(ValidationError, {
  allowProps: ['key', 'expect', 'received'],
});
