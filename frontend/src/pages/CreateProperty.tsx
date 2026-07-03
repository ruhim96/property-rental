import { useState, FormEvent, ChangeEvent, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getApiError } from '../services/api';
import type { CreatePropertyInput, Property, UploadResponse } from '../types';

export default function CreateProperty() {
  const [form, setForm] = useState<CreatePropertyInput>({
    title: '',
    description: '',
    location: '',
    pricePerNight: 0,
    images: []
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'pricePerNight' ? Number(value) : value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      // Upload images
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('images', f));
      const uploadRes = await api.post<UploadResponse>('/upload', formData);

      // Create property
      const { data } = await api.post<Property>('/properties', {
        ...form,
        images: uploadRes.data.urls
      });
      navigate(`/property/${data._id}`);
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>List Your Property</h2>
        <p style={styles.subtitle}>Share your space with travelers around the world</p>
        
        <form onSubmit={submit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Property Title</label>
            <input 
              name="title"
              placeholder="Cozy beachfront villa"
              value={form.title}
              onChange={handleChange}
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Location</label>
            <input 
              name="location"
              placeholder="Bali, Indonesia"
              value={form.location}
              onChange={handleChange}
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Price per Night ($)</label>
            <input 
              type="number"
              name="pricePerNight"
              placeholder="150"
              value={form.pricePerNight}
              onChange={handleChange}
              min="1"
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea 
              name="description"
              placeholder="Describe your property..."
              value={form.description}
              onChange={handleChange}
              rows={5}
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Images (up to 5)</label>
            <input 
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ padding: '0.5rem' }}
            />
          </div>
          
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating...' : 'Create Property'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
    background: '#f7f7f7'
  },
  card: {
    background: 'white',
    padding: '3rem',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto'
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
  }
};