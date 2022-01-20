import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export type PostProps = {
  id: number;
  title: string;
  author: {
    name: string;
  };
  content: string;
  published: boolean;
};

const Post: React.FC<{ post: PostProps }> = ({ post }) => {
  const navigate = useNavigate();
  const authorName = post.author ? post.author.name : 'Unknown author';
  return (
    <div
      style={{
        color: 'inherit',
        padding: '2rem',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/p/${post.id}`)}
    >
      <h2>{post.title}</h2>
      <small>By {authorName}</small>
      <ReactMarkdown children={post.content} />
    </div>
  );
};

export default Post;
