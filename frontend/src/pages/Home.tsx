import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Property } from '../types';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Property[]>('/properties')
      .then(res => setProperties(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading properties...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Find your perfect stay</h1>
        <p style={styles.heroSubtitle}>Discover unique homes and experiences around the world</p>
      </div>

      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Available Properties</h2>
        
        {properties.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No properties available yet.</p>
        ) : (
          <div style={styles.grid}>
            {properties.map(p => (
              <Link key={p._id} to={`/property/${p._id}`} style={styles.card}>
                <div style={styles.imageWrapper}>
                  <img 
                    src={p.images?.[0] || 'https://via.placeholder.com/400x300'} 
                    alt={p.title} 
                    style={styles.image}
                  />
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{p.title}</h3>
                  </div>
                  <p style={styles.location}>📍 {p.location}</p>
                  <p style={styles.price}>
                    <strong>${p.pricePerNight}</strong>
                    <span style={styles.priceUnit}> / night</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: { minHeight: '100vh' },
  loading: { textAlign: 'center', padding: '4rem', fontSize: '1.25rem', color: '#666' },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '4rem 2rem',
    textAlign: 'center'
  },
  heroTitle: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' },
  heroSubtitle: { fontSize: '1.25rem', opacity: 0.9 },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' },
  sectionTitle: { fontSize: '2rem', marginBottom: '2rem', color: '#222' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },
  imageWrapper: { position: 'relative', overflow: 'hidden', height: '240px' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  cardContent: { padding: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' },
  cardTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#222' },
  location: { color: '#666', fontSize: '0.95rem', marginBottom: '0.75rem' },
  price: { fontSize: '1.1rem', color: '#222' },
  priceUnit: { fontWeight: 'normal', color: '#666' }
};