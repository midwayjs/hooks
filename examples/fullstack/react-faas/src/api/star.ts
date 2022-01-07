import { Decorate, Post } from '@midwayjs/hooks';
import { fetch } from '@midwayjs/rpc';

export default Decorate(Post(), async (repo: string) => {
  const response = await fetch(`https://api.github.com/repos/${repo}`);
  const json = await response.json();
  return {
    stars: json.stargazers_count,
  };
});
