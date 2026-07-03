import { useEffect, useState, CSSProperties } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getApiError } from '../services/api';
import type { Booking, Property, User } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hostBookings, setHostBookings] = useState<Booking[]>([]);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        // Always load guest bookings
        const bookingsRes = await api.get<Booking[]>('/bookings/my');
        setBookings(bookingsRes.data);

        if (user.role === 'property_lister' || user.role === 'admin') {
          // Load incoming bookings for host's properties
          const hostBookingsRes = await api.get<Booking[]>('/bookings/host');
          setHostBookings(hostBookingsRes.data);

          // Load host's properties
          const propsRes = await api.get<Property[]>('/properties');
          setMyProperties(propsRes.data.filter(p => {
            const ownerId = typeof p.owner === 'string' ? p.owner : p.owner._id;
            return ownerId === user._id;
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const confirmBooking = async (bookingId: string) => {
    if (!window.confirm('Confirm this booking?')) return;
    try {
      await api.put(`/bookings/${bookingId}/confirm`);
      setHostBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, status: 'confirmed' } : b)
      );
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const cancelBooking = async (bookingId: string, isHost: boolean = false) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      if (isHost) {
        setHostBookings(prev =>
          prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
        );
      } else {
        setBookings(prev =>
          prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
        );
      }
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const getStatusStyle = (status: string): CSSProperties => ({
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'capitalize',
    background: status === 'confirmed' ? '#d4edda' : 
                status === 'cancelled' ? '#f8d7da' : '#fff3cd',
    color: status === 'confirmed' ? '#155724' : 
           status === 'cancelled' ? '#721c24' : '#856404'
  });

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Welcome, {user?.name}</h2>
        <div style={styles.roleBadge}>
          Role: <strong>{user?.role}</strong>
        </div>
      </div>

      {/* GUEST SECTION: My Bookings */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>🎫 My Bookings</h3>
        {bookings.length === 0 ? (
          <p style={styles.empty}>No bookings yet. Start exploring!</p>
        ) : (
          <div style={styles.grid}>
            {bookings.map(b => {
              const prop = b.property as Property;
              return (
                <div key={b._id} style={styles.bookingCard}>
                  <h4 style={styles.bookingTitle}>{prop?.title || 'Property'}</h4>
                  <p style={styles.bookingInfo}>
                    📅 {new Date(b.checkIn).toDateString()} → {new Date(b.checkOut).toDateString()}
                  </p>
                  <p style={styles.bookingInfo}>💰 Total: ${b.totalPrice}</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={getStatusStyle(b.status)}>{b.status}</span>
                  </div>
                  {b.status !== 'cancelled' && (
                    <button
                      onClick={() => cancelBooking(b._id, false)}
                      style={styles.cancelBtn}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* HOST SECTION: Incoming Booking Requests */}
      {(user?.role === 'property_lister' || user?.role === 'admin') && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>📨 Incoming Booking Requests</h3>
          {hostBookings.length === 0 ? (
            <p style={styles.empty}>No booking requests yet.</p>
          ) : (
            <div style={styles.grid}>
              {hostBookings.map(b => {
                const prop = b.property as Property;
                const guest = b.guest as User;
                return (
                  <div key={b._id} style={styles.hostBookingCard}>
                    <div style={styles.hostBookingHeader}>
                      <h4 style={styles.bookingTitle}>{prop?.title}</h4>
                      <span style={getStatusStyle(b.status)}>{b.status}</span>
                    </div>
                    <div style={styles.guestInfo}>
                      <p><strong>Guest:</strong> {guest?.name || 'Unknown'}</p>
                      <p><strong>Email:</strong> {guest?.email || 'N/A'}</p>
                    </div>
                    <p style={styles.bookingInfo}>
                      📅 {new Date(b.checkIn).toDateString()} → {new Date(b.checkOut).toDateString()}
                    </p>
                    <p style={styles.bookingInfo}>💰 Total: ${b.totalPrice}</p>

                    {b.status === 'pending' && (
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => confirmBooking(b._id)}
                          style={styles.confirmBtn}
                        >
                          ✓ Confirm
                        </button>
                        <button
                          onClick={() => cancelBooking(b._id, true)}
                          style={styles.cancelBtn}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* HOST SECTION: My Properties */}
      {(user?.role === 'property_lister' || user?.role === 'admin') && (
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>🏠 My Properties</h3>
          {myProperties.length === 0 ? (
            <p style={styles.empty}>No properties listed yet.</p>
          ) : (
            <div style={styles.grid}>
              {myProperties.map(p => (
                <div key={p._id} style={styles.propertyCard}>
                  <img 
                    src={p.images?.[0] || 'https://via.placeholder.com/300x200'}
                    alt={p.title}
                    style={styles.propertyImage}
                  />
                  <div style={styles.propertyInfo}>
                    <h4 style={styles.propertyTitle}>{p.title}</h4>
                    <p style={styles.propertyLocation}>📍 {p.location}</p>
                    <p style={styles.propertyPrice}>${p.pricePerNight}/night</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  loading: { textAlign: 'center', padding: '4rem', fontSize: '1.25rem', color: '#666' },
  header: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: '2rem', fontWeight: 'bold', color: '#222' },
  roleBadge: {
    padding: '0.5rem 1rem',
    background: '#f7f7f7',
    borderRadius: '8px',
    color: '#666'
  },
  section: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '2rem'
  },
  sectionTitle: { fontSize: '1.5rem', marginBottom: '1.5rem', color: '#222' },
  empty: { color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  bookingCard: {
    padding: '1.5rem',
    background: '#f7f7f7',
    borderRadius: '12px',
    border: '1px solid #eee'
  },
  hostBookingCard: {
    padding: '1.5rem',
    background: '#f7f7f7',
    borderRadius: '12px',
    border: '2px solid #667eea'
  },
  hostBookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem'
  },
  bookingTitle: { fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' },
  bookingInfo: { color: '#666', marginBottom: '0.5rem' },
  guestInfo: {
    padding: '0.75rem',
    background: 'white',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    fontSize: '0.9rem'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem'
  },
  confirmBtn: {
    flex: 1,
    background: '#28a745',
    color: 'white',
    padding: '0.6rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600'
  },
  cancelBtn: {
    flex: 1,
    background: '#dc3545',
    color: 'white',
    padding: '0.6rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600'
  },
  propertyCard: {
    background: '#f7f7f7',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #eee'
  },
  propertyImage: { width: '100%', height: '180px', objectFit: 'cover' },
  propertyInfo: { padding: '1rem' },
  propertyTitle: { fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' },
  propertyLocation: { color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' },
  propertyPrice: { color: '#ff385c', fontWeight: '600' }
};