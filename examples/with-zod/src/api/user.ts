import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function login(user: z.infer<typeof UserSchema>) {
  const validation = UserSchema.safeParse(user);
  if (validation.success === false) {
    return {
      success: false,
      data: null,
      message: 'Invalid user',
    };
  }

  // logic logic
  return {
    success: true,
    data: 'Login Success',
    message: 'Login Success',
  };
}
