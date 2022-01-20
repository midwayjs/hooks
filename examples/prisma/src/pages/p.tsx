import { useRequest } from 'ahooks';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import { deletePost, getPost, publishPost } from '../api/post';
import Layout from '../components/Layout';

const P = () => {
  const { id } = useParams();
  const { data, loading } = useRequest(() => getPost({ params: { id } }));
  const navigate = useNavigate();

  async function publish(id: number): Promise<void> {
    await publishPost({ params: { id: id.toString() } });
    navigate('/');
  }

  async function destroy(id: number): Promise<void> {
    await deletePost({ params: { id: id.toString() } });
    navigate('/');
  }

  if (loading) {
    return null;
  }

  let title = data.title;
  if (!data.published) {
    title = `${title} (Draft)`;
  }

  return (
    <Layout>
      <div>
        <h2>{title}</h2>
        <p>By {data?.author?.name || 'Unknown author'}</p>
        <ReactMarkdown children={data.content} />
        {!data.published && (
          <button onClick={() => publish(data.id)}>Publish</button>
        )}
        <button onClick={() => destroy(data.id)}>Delete</button>
      </div>
    </Layout>
  );
};

export default P;
