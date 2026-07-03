import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getApiError } from '../services/api';
import type { RegisterInput, AuthResponse } from '../types';

export default function Register() {
  const [form, setForm] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', form);
      login(data);
      navigate('/');
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join our community of travelers</p>
        
        <form onSubmit={submit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required 
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input 
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required 
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required 
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>I want to...</label>
            <select 
              name="role" 
              value={form.role} 
              onChange={(e) => setForm({ ...form, role: e.target.value as 'user' | 'property_lister' })}
            >
              <option value="user">Book stays (Guest)</option>
              <option value="property_lister">List properties (Host)</option>
            </select>
          </div>
          
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem'
  },
  card: {
    background: 'white',
    padding: '3rem',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '450px',
    width: '100%'
  },
  title: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#222' },
  subtitle: { color: '#666', marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontWeight: '600', color: '#222' },
  button: {
    background: 'linear-gradient(135deg, #ff385c 0%, #e31c5f 100%)',
    color: 'white',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    marginTop: '1rem'
  },
  footer: { textAlign: 'center', marginTop: '2rem', color: '#666' },
  link: { color: '#ff385c', fontWeight: '600' }
};