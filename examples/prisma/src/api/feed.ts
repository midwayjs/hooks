import { Api, Get } from '@midwayjs/hooks';
import { prisma } from './prisma';

export default Api(Get(), async () => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true },
  });
  return posts;
});
