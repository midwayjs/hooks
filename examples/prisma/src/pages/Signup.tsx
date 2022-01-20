import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../api/user';
import Layout from '../components/Layout';
import './Signup.css';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      await signUp(name, email);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="signup-page">
        <form onSubmit={submitData}>
          <h1>Signup user</h1>
          <input
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            type="text"
            value={name}
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="text"
            value={email}
          />
          <input disabled={!name || !email} type="submit" value="Signup" />
          <a className="back" href="#" onClick={() => navigate('/')}>
            or Cancel
          </a>
        </form>
      </div>
    </Layout>
  );
};

export default SignUp;
