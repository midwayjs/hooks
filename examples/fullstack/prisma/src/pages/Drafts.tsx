import React from 'react';
import Layout from '../components/Layout';
import Post from '../components/Post';
import { useRequest } from 'ahooks';
import fetchDrafts from '../api/drafts';
import './Drafts.css';

const Drafts: React.FC = () => {
  const { data, loading } = useRequest(() => fetchDrafts());

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <div className="page">
        <h1>Drafts</h1>
        <main>
          {data.map((post) => (
            <div key={post.id} className="post">
              <Post post={post} />
            </div>
          ))}
        </main>
      </div>
    </Layout>
  );
};

export default Drafts;
