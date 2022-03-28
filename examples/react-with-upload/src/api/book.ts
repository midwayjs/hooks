import { Api, Get, Params, Query, useContext } from '@midwayjs/hooks';
import type { Context } from '@midwayjs/koa';

const books = [
  {
    id: 1,
    title: 'The Lord of the Rings',
  },
  {
    id: 2,
    title: 'The Hobbit',
  },
  {
    id: 3,
    title: 'The Catcher in the Rye',
  },
  {
    id: 4,
    title: 'Gone with the Wind',
  },
  {
    id: 5,
    title: 'To Kill a Mockingbird',
  },
  {
    id: 6,
    title: 'Pride and Prejudice',
  },
  {
    id: 7,
    title: 'The Great Gatsby',
  },
  {
    id: 8,
    title: 'The Scarlet Letter',
  },
  {
    id: 9,
    title: 'The Grapes of Wrath',
  },
  {
    id: 10,
    title: 'The Great Gatsby',
  },
];

export const getBookByParams = Api(
  Get('/book/:id'),
  Params<{ id: string }>(),
  async () => {
    const ctx = useContext<Context>();
    const { id } = ctx.params;
    const book = books.find((b) => b.id === Number(id));
    if (!book) {
      ctx.throw(400, 'book not found');
    }
    return book;
  }
);

export const getBookByQuery = Api(
  Get('/book'),
  Query<{ id: string }>(),
  async () => {
    const ctx = useContext<Context>();
    const { id } = ctx.query;
    const book = books.find((b) => b.id === Number(id));
    if (!book) {
      ctx.throw(400, 'book not found');
    }
    return book;
  }
);
