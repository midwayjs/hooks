import {
  UserExistError,
  UserNotFoundError,
  ValidationError,
} from '../error/user';
import { prisma } from '../prisma';

function validate(email: string, password: string) {
  if (!email) {
    throw new ValidationError('email', 'string', email);
  }

  if (!password) {
    throw new ValidationError('password', 'string', password);
  }
}

export async function login(email: string, password: string) {
  validate(email, password);

  const user = await prisma.user.findFirst({
    where: { email, password },
    select: { id: true, email: true },
  });

  if (!user) throw new UserNotFoundError();

  return user;
}

export async function register(email: string, password: string) {
  validate(email, password);

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    throw new UserExistError();
  }

  return await prisma.user.create({
    data: { email, password },
    select: { id: true, email: true },
  });
}
