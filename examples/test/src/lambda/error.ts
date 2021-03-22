import { AuthError } from '../error/auth';

export async function returnError() {
  return {
    err: new Error('this is error'),
  };
}

export async function returnCustomError(key: string) {
  return {
    err: new AuthError(key),
  };
}

export async function throwError() {
  throw new Error('this is error');
}

export async function throwCustomError(key: string) {
  throw new AuthError(key);
}
