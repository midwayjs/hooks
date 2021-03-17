import { useContext } from '@midwayjs/hooks';
import { Context } from '@midwayjs/faas';

function useFaaSContext() {
  return useContext<Context>();
}

export default async () => {
  const ctx = useFaaSContext();
  return {
    message: 'Hello World',
    method: ctx.method,
  };
};

export const post = async (message: string) => {
  const ctx = useFaaSContext();

  return {
    message: 'Your message: ' + message,
    method: ctx.method,
  };
};
