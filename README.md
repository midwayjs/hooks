<h1 align="center">Functional Fullstack Framework</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@midwayjs/hooks">
    <img src="https://img.shields.io/npm/v/@midwayjs/hooks/latest?style=for-the-badge">
  </a>
  <img src="https://img.shields.io/github/workflow/status/midwayjs/hooks/Node.js%20CI/master?style=for-the-badge">
  <a href="https://codecov.io/gh/midwayjs/hooks">
    <img src="https://img.shields.io/codecov/c/github/midwayjs/hooks?style=for-the-badge">
  </a>
  <img src="https://img.shields.io/npm/l/@midwayjs/hooks?style=for-the-badge">
</p>

<h5 align="center">"Zero" Api & Type Safe & Fullstack Kit & Powerful Backend</h5>
<h5 align="center">At Alibaba, 2800+ full-stack applications are developed based on Midway Hooks (2022.01)</h5>

English | [简体中文](./README.zh-cn.md)

## ✨ Features

- ☁️ Maximize productivity and developer experience, support fullstack development & API service
- ⚡️ Fullstack kit that supports React/Vue/Svelte... and more frameworks
- 🌈 "Zero" Api data layer, import functions from the backend to call the API directly, without the ajax glue layer
- ⛑️ Type safe, use the identical type definition from frontend to backend, detect errors in advance
- 🌍 Functional programming, using `Hooks` for frontend and backend
- ⚙️ Support for `Webpack / Vite` based projects
- ✈️ Deploy to Server or Serverless
- 🛡 Based on Midway, a powerful Node.js framework that supports enterprise-level application development

## 🔨 Preview

<table>
<tr>
<th style="text-align: center;"> Backend(Midway Hooks) </th>
<th style="text-align: center;"> Frontend(React) </th>
</tr>
<tr>
<td>
<sub>

<!-- prettier-ignore -->
```tsx
// src/api/index.ts
import {
  Api,
  Get,
  Post,
  Validate,
  Query,
  useContext,
} from '@midwayjs/hooks';
import { z } from 'zod';
import db from './database';

export const getArticles = Api(
  Get(),
  Query<{ page: string; per_page: string }>(),
  async () => {
    const ctx = useContext();

    const articles = await db.articles.find({
      page: ctx.query.page,
      per_page: ctx.query.per_page,
    });

    return articles;
  }
);

const ArticleSchema = z.object({
  title: z.string().min(3).max(16),
  content: z.string().min(1),
});

export const createArticle = Api(
  Post(),
  Validate(ArticleSchema),
  async (article: z.infer<typeof ArticleSchema>) => {
    const newArticle = await db.articles.create(article);
    return {
      id: newArticle.id,
    };
  }
);
```

</sub>
</td>
<td>

<sub>

```ts
// src/pages/articles.tsx
import { getArticles } from '../api';
import { useRequest } from 'ahooks';
import ArticleList from './components/ArticleList';

export default () => {
  const { data } = useRequest(() =>
    getArticles({
      query: {
        page: '1',
        per_page: '10',
      },
    })
  );

  return <ArticleList articles={data} />;
};

// src/pages/new.tsx
import { createArticle } from '../api';
import Editor from './components/Editor';
import { useState } from 'react';

export default () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (article) => {
    setLoading(true);
    const { id } = await createArticle(article);
    setLoading(false);
    location.href = `/articles/${id}`;
  };

  return <Editor loading={loading} onSubmit={handleSubmit} />;
};
```

</sub>
</td>
</tr>
</table>

## 🧩 Templates

Midway Hooks currently provide the following templates:

- Fullstack
  - [react](https://github.com/midwayjs/hooks/blob/main/examples/react)
  - [vue](https://github.com/midwayjs/hooks/blob/main/examples/vue)
  - [prisma](https://github.com/midwayjs/hooks/blob/main/examples/prisma)
  - [react-with-upload](https://github.com/midwayjs/hooks/blob/main/examples/react-with-upload)
- Serverless
  - [react-faas](https://github.com/midwayjs/hooks/blob/main/examples/react-faas)
  - [vue-faas](https://github.com/midwayjs/hooks/blob/main/examples/vue-faas)
- Api Server
  - [api](https://github.com/midwayjs/hooks/blob/main/examples/api)
  - [api-bundle](https://github.com/midwayjs/hooks/blob/main/examples/api-bundle)

You can create applications quickly with templates:

```bash
npx degit https://github.com/midwayjs/hooks/examples/<name>
```

For example, create a fullstack application with react:

```bash
npx degit https://github.com/midwayjs/hooks/examples/react
```

## Contribute

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

We use yarn + lerna to manage the project.

- install dependencies

```bash
$ yarn
```

- build

```bash
$ yarn build
```

- watch

```bash
$ yarn watch
```

- test

```bash
$ yarn test
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://blog.lxxyx.cn/"><img src="https://avatars.githubusercontent.com/u/13161470?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lxxyx</b></sub></a><br /><a href="https://github.com/midwayjs/hooks/commits?author=Lxxyx" title="Code">💻</a> <a href="#content-Lxxyx" title="Content">🖋</a> <a href="#ideas-Lxxyx" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/midwayjs/hooks/pulls?q=is%3Apr+reviewed-by%3ALxxyx" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/midwayjs/hooks/commits?author=Lxxyx" title="Tests">⚠️</a> <a href="https://github.com/midwayjs/hooks/commits?author=Lxxyx" title="Documentation">📖</a></td>
    <td align="center"><a href="https://iam.gy/"><img src="https://avatars.githubusercontent.com/u/14832743?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gao Yang</b></sub></a><br /><a href="https://github.com/midwayjs/hooks/commits?author=echosoar" title="Code">💻</a> <a href="#content-echosoar" title="Content">🖋</a> <a href="https://github.com/midwayjs/hooks/commits?author=echosoar" title="Tests">⚠️</a> <a href="https://github.com/midwayjs/hooks/commits?author=echosoar" title="Documentation">📖</a></td>
    <td align="center"><a href="http://i5ting.com/"><img src="https://avatars.githubusercontent.com/u/3118295?v=4?s=100" width="100px;" alt=""/><br /><sub><b>狼叔</b></sub></a><br /><a href="https://github.com/midwayjs/hooks/commits?author=i5ting" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.yuque.com/eward/blog"><img src="https://avatars.githubusercontent.com/u/452899?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Eward</b></sub></a><br /><a href="https://github.com/midwayjs/hooks/commits?author=shepherdwind" title="Code">💻</a></td>
    <td align="center"><a href="https://linbudu.top/"><img src="https://avatars.githubusercontent.com/u/48507806?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Linbudu</b></sub></a><br /><a href="https://github.com/midwayjs/hooks/commits?author=linbudu599" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/rojer95"><img src="https://avatars.githubusercontent.com/u/20662049?v=4?s=100" width="100px;" alt=""/><br /><sub><b>rojer</b></sub></a><br /><a href="https://github.com/midwayjs/hooks/commits?author=rojer95" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Thetiso"><img src="https://avatars.githubusercontent.com/u/8968567?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Thetiso</b></sub></a><br /><a href="https://github.com/midwayjs/hooks/commits?author=Thetiso" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## About

[Alibaba Open Source](https://opensource.alibaba.com/)

## License

[MIT](LICENSE)
