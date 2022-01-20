import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const isActive: (pathname: string) => boolean = (pathname) =>
    location.pathname === pathname;

  return (
    <nav>
      <div className="left">
        <Link to="/" className="bold" data-active={isActive('/')}>
          Blog
        </Link>
        <Link to="/drafts" data-active={isActive('/drafts')}>
          Drafts
        </Link>
      </div>
      <div className="right">
        <Link to="/signup" data-active={isActive('/signup')}>
          Signup
        </Link>
        <Link to="/create" data-active={isActive('/create')}>
          + Create draft
        </Link>
      </div>
    </nav>
  );
};

export default Header;
