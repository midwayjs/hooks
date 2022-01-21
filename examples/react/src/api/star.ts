import { Api, Post } from '@midwayjs/hooks';
import fetch from 'isomorphic-unfetch';

export default Api(Post(), async (repo: string) => {
  const response = await fetch(`https://api.github.com/repos/${repo}`);
  const json = await response.json();
  return {
    stars: json.stargazers_count,
  };
});
