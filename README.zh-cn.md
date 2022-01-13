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

<h1 align="center">函数式全栈框架</h1>

<h5 align="center">"零" Api & 类型安全 & 全栈套件 & 强大后端</h5>
<h5 align="center">在阿里巴巴，有 2800+ 全栈应用基于 Midway Hooks 开发（2022.01）</h5>

[English](./README.md) | 简体中文

## ✨ 特性

- ☁️&nbsp;&nbsp;最大化生产力 & 开发者体验，支持开发全栈应用 & Api 服务
- ⚡️&nbsp;&nbsp;开箱即用的全栈套件，支持 React/Vue/Svelte...多框架
- 🌈&nbsp;&nbsp;"零" API，全栈应用下导入函数直接调用接口，抹去胶水层
- ⛑️&nbsp;&nbsp;类型安全，从前端到后端使用同一份类型定义，提前发现错误
- 🌍&nbsp;&nbsp;函数式编程，前后端统一使用 `Hooks`
- ⚙️&nbsp;&nbsp;支持 Webpack / Vite 前端工程体系接入
- ✈️&nbsp;&nbsp;部署至 Server & Serverless
- 🛡&nbsp;&nbsp;基于超强的 Node.js 框架 Midway，支撑企业级应用开发

## 🌰 Demo

<table>
<tr>
<th style="text-align: center;"> 前端(React) </th>
<th style="text-align: center;"> 后端(Midway Hooks) </th>
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

1. Fork 仓库!
2. 创建分支: `git checkout -b my-new-feature`
3. 提交改动: `git commit -am 'Add some feature'`
4. 推送到刚才创建的分支: `git push origin my-new-feature`
5. 提交 Pull Request :D

我们使用 yarn + lerna 管理项目

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

## 关于我们

[Alibaba Open Source](https://opensource.alibaba.com/)
