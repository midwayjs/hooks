import React from 'react';
import ReactDOM from 'react-dom';
import { useRequest } from 'ahooks';
import { getDate } from './api/date';
import './index.css';
import fetchGithubStars from './api/star';
import { getBookByParams, getBookByQuery } from './api/book';

function App() {
  const { data: date } = useRequest(() => getDate());
  const { data: repo } = useRequest(() => fetchGithubStars('midwayjs/midway'));
  const { data: book } = useRequest(() =>
    getBookByParams({ params: { id: '1' } })
  );
  const { data: book2 } = useRequest(() =>
    getBookByQuery({ query: { id: '2' } })
  );

  return (
    <div className="app">
      <img src="/logo.png" className="logo"></img>
      <h1>Hello Midway Hooks</h1>
      <div>
        <p>
          <span className="lambda">{'λ GET'}</span>
          <span className="lambda">{'api/date.ts -> getDate()'}</span>
          <span>Server Date: {date}</span>
        </p>
        <p>
          <span className="lambda">{'λ POST'}</span>
          <span className="lambda">{`api/star.ts -> fetchStars('midwayjs/midway')`}</span>
          <span>Github Stars: {repo?.stars}</span>
        </p>
        <p>
          <span className="lambda">{'λ GET'}</span>
          <span className="lambda">{`api/book.ts -> getBookByParams({ param: { id: '1' } })`}</span>
          <span>Book title: {book?.title}</span>
        </p>
        <p>
          <span className="lambda">{'λ GET'}</span>
          <span className="lambda">{`api/book.ts -> getBookByQuery({ query: { id: '1' } })`}</span>
          <span>Book title: {book2?.title}</span>
        </p>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
