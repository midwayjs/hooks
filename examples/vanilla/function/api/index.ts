import { useContext } from '@midwayjs/hooks';
import type { Context } from '@midwayjs/koa';

function useKoaContext() {
  return useContext<Context>();
}

export default async () => {
  return {
    message: 'Hello World',
    method: useKoaContext().method,
  };
};

export const get = async () => {
  return 'get';
};

export const post = async (name: string) => {
  return { method: 'POST', name };
};
