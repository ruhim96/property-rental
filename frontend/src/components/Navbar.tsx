import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { CSSProperties } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <span style={styles.logo}>🏠</span>
          <span style={styles.brandText}>StayEasy</span>
        </Link>
        
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Home</Link>
          {user && <Link to="/dashboard" style={styles.link}>Dashboard</Link>}
          {user?.role === 'property_lister' && (
            <Link to="/create-property" style={styles.link}>List Property</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" style={styles.link}>Admin</Link>
          )}
          
          {!user ? (
            <div style={styles.authButtons}>
              <Link to="/login" style={styles.loginLink}>Login</Link>
              <Link to="/register" style={styles.signupButton}>Sign Up</Link>
            </div>
          ) : (
            <div style={styles.userInfo}>
              <span style={styles.userName}>Hi, {user.name}</span>
              <button onClick={logout} style={styles.logoutBtn}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, CSSProperties> = {
  nav: {
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: '#222'
  },
  logo: { fontSize: '2rem' },
  brandText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #ff385c 0%, #e31c5f 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  link: {
    color: '#222',
    textDecoration: 'none',
    fontWeight: '500'
  },
  authButtons: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  loginLink: {
    color: '#222',
    textDecoration: 'none',
    fontWeight: '600'
  },
  signupButton: {
    background: '#ff385c',
    color: 'white',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  userName: {
    color: '#222',
    fontWeight: '500'
  },
  logoutBtn: {
    background: 'transparent',
    color: '#ff385c',
    border: '2px solid #ff385c',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};