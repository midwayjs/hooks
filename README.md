<p align="center">
  <img src="https://img.alicdn.com/imgextra/i4/O1CN01AJ1lNS20vkL7tTuUj_!!6000000006912-2-tps-1060-868.png" height="300" alt="Midway Logo" />
</p>

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

<h1 align="center">Functional Fullstack Framework</h1>

<h5 align="center">"Zero" Api & Type Safe & Fullstack Kit & Powerful Backend</h5>
<h5 align="center">At Alibaba, 2800+ full-stack applications are developed based on Midway Hooks (2022.01)</h5>

English | [简体中文](./README.zh-cn.md)

## ✨ Features

- ☁️&nbsp;&nbsp;Maximize productivity and developer experience, support fullstack development & API service
- ⚡️&nbsp;&nbsp;Fullstack kit that supports React/Vue/Svelte... and more frameworks
- 🌈&nbsp;&nbsp;Functional programming, using `Hooks` for frontend and backend
- ⛑️&nbsp;&nbsp;Type safe, use the identical type definition from frontend to backend, detect errors in advance
- 🌍&nbsp;&nbsp;"Zero" Api data layer, import functions from the backend to call the API directly, without the ajax glue layer
- ⚙️&nbsp;&nbsp;Support for `Webpack / Vite` based projects
- ✈️&nbsp;&nbsp;Deploy to Server or Serverless
- 🛡&nbsp;&nbsp;Based on Midway, a powerful Node.js framework that supports enterprise-level application development

## 🌰 Demo

<table>
<tr>
<th style="text-align: center;"> Frontend(React) </th>
<th style="text-align: center;"> Backend(Midway Hooks) </th>
</tr>
<tr>
<td>
<sub>

<!-- prettier-ignore -->
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

  const handleSubmit = async (title: string, content: string) => {
    setLoading(true);
    const { id } = await createArticle({ title, content });
    setLoading(false);
    location.href = `/articles/${id}`;
  };

  return <Editor loading={loading} onSubmit={handleSubmit} />;
};

```

</sub>
</td>
<td>

<sub>

```ts
// src/api/index.ts
import { Api, Get, Post, Validate, Query, useContext } from '@midwayjs/hooks';
import { z } from 'zod';
import database from './database';

export const getArticles = Api(
  Get(),
  Query<{ page: string; per_page: string }>(),
  async () => {
    const ctx = useContext();

    const articles = await database.articles.find({
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
    const newArticle = await database.articles.create(article);
    return {
      id: newArticle.id,
    };
  }
);
```

</sub>
</td>
</tr>
</table>

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

## About

[Alibaba Open Source](https://opensource.alibaba.com/)
