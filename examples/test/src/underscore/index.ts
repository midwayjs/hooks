import { useContext } from '@midwayjs/hooks';

export const api = async () => {
  const ctx = useContext();
  return {
    path: ctx.path,
  };
};
