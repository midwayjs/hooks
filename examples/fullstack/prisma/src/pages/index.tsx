import React from 'react';
import { useRequest } from 'ahooks';
import './index.css';
import Layout from '../components/Layout';
import fetchFeeds from '../api/feed';
import Post from '../components/Post';

export default function Index() {
  const { data, loading } = useRequest(() => fetchFeeds());

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <div className="page">
        <h1>My Blog</h1>
        <main>
          {data.map((post) => (
            <div key={post.id} className="post">
              <Post post={post} />
            </div>
          ))}
        </main>
        <p className="logo-wrapper">
          Powered by
          <a href="https://github.com/midwayjs/hooks" target="_blank">
            <img
              alt="https://github.com/midwayjs/hooks"
              src="/logo.png"
              className="logo"
            />
          </a>
        </p>
      </div>
    </Layout>
  );
}
