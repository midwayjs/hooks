import { createApp, HooksApplication } from '@midwayjs/hooks-testing-library';
import { prisma } from '../prisma';
import { login } from './user';

// TODO generate prisma client before run test suite
describe.skip('test new features', () => {
  let app: HooksApplication;
  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$connect();
  });

  it('should create user', async () => {
    const mockUser = {
      email: 'mock@midwayjs.com',
      password: 'mock',
    };

    const response = await app.runFunction(
      login,
      mockUser.email,
      mockUser.password
    );
    expect(response).toMatchInlineSnapshot();
  });
});
