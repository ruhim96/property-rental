import { useEffect, useState, CSSProperties } from 'react';
import api, { getApiError } from '../services/api';
import type { AdminStats, User } from '../types';

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats>({ users: 0, properties: 0, bookings: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<AdminStats>('/admin/stats'),
      api.get<User[]>('/admin/users')
    ])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data);
        setUsers(usersRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert(getApiError(err));
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Panel</h2>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
          <p style={styles.statLabel}>Total Users</p>
          <p style={styles.statValue}>{stats.users}</p>
        </div>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
          <p style={styles.statLabel}>Properties</p>
          <p style={styles.statValue}>{stats.properties}</p>
        </div>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
          <p style={styles.statLabel}>Bookings</p>
          <p style={styles.statValue}>{stats.bookings}</p>
        </div>
      </div>

      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>All Users</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.roleBadge,
                      background: u.role === 'admin' ? '#ff385c' : 
                                  u.role === 'property_lister' ? '#667eea' : '#28a745'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => deleteUser(u._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  loading: { textAlign: 'center', padding: '4rem', fontSize: '1.25rem', color: '#666' },
  title: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#222' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    padding: '2rem',
    borderRadius: '16px',
    color: 'white',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  statLabel: { fontSize: '1rem', opacity: 0.9, marginBottom: '0.5rem' },
  statValue: { fontSize: '2.5rem', fontWeight: 'bold' },
  tableCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  tableTitle: { fontSize: '1.5rem', marginBottom: '1.5rem', color: '#222' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '2px solid #eee',
    color: '#666',
    fontWeight: '600',
    fontSize: '0.9rem',
    textTransform: 'uppercase'
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #f0f0f0',
    color: '#222'
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  deleteBtn: {
    background: '#dc3545',
    color: 'white',
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    border: 'none',
    cursor: 'pointer'
  }
};