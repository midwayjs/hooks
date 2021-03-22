import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library';
import { AuthError } from '../error/auth';
import {
  returnCustomError,
  returnError,
  throwCustomError,
  throwError,
} from './error';

describe('test new features', () => {
  let app: HooksApplication;
  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  test('should return error', async () => {
    const { err } = await app.runFunction(returnError);
    expect(err).toBeInstanceOf(Error);
    expect(err).toMatchInlineSnapshot(`[Error: this is error]`);
  });

  test('should return custom error', async () => {
    const { err } = await app.runFunction(returnCustomError, 'TEST');

    expect(err).toBeInstanceOf(AuthError);
    expect(err.key).toEqual('TEST');
  });

  test('should throw error and status should be 500', async () => {
    try {
      await app.runFunction(throwError);
    } catch (err) {
      expect(err).toMatchInlineSnapshot(`[Error: this is error]`);
      // Should not expose error stack
      expect(err.stack).toBeFalsy();
    }

    const response = await app.request(throwError).expect(500);
    expect(response.body).toBeInstanceOf(Error);
  });

  test('should throw custom error and status should be 500', async () => {
    try {
      await app.runFunction(throwCustomError, 'TEST');
    } catch (error) {
      expect(error).toBeInstanceOf(AuthError);
      expect(error).toMatchInlineSnapshot(`[AuthError]`);
    }

    const response = await app.request(throwCustomError, 'TEST').expect(500);
    expect(response.body).toBeInstanceOf(AuthError);
    expect(response.body.key).toEqual('TEST');
  });
});
