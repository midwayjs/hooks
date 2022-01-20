import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages';
import Create from './pages/Create';
import Drafts from './pages/Drafts';
import P from './pages/p';
import SignUp from './pages/Signup';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/create" element={<Create />} />
      <Route path="/drafts" element={<Drafts />} />
      <Route path="/p/:id" element={<P />} />
    </Routes>
  );
}

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
