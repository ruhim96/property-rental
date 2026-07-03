import { useEffect, useState, FormEvent, ChangeEvent, CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getApiError } from '../services/api';
import type { Property, Review, CreateReviewInput } from '../types';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [reviewForm, setReviewForm] = useState<CreateReviewInput>({
    propertyId: '',
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<Property>(`/properties/${id}`),
      api.get<Review[]>(`/reviews/property/${id}`)
    ])
      .then(([propRes, revRes]) => {
        setProperty(propRes.data);
        setReviews(revRes.data);
        setReviewForm(prev => ({ ...prev, propertyId: id }));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const book = async () => {
    if (!dates.checkIn || !dates.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    try {
      await api.post('/bookings', { propertyId: id, ...dates });
      alert('Booking created successfully!');
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reviews', reviewForm);
      const res = await api.get<Review[]>(`/reviews/property/${id}`);
      setReviews(res.data);
      setReviewForm({ propertyId: id || '', rating: 5, comment: '' });
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!property) return <div style={styles.loading}>Property not found</div>;

  const ownerName = typeof property.owner === 'string' ? 'Host' : property.owner.name;

  return (
    <div style={styles.container}>
      <div style={styles.imageSection}>
        <img 
          src={property.images?.[0] || 'https://via.placeholder.com/1200x600'} 
          alt={property.title}
          style={styles.mainImage}
        />
      </div>

      <div style={styles.content}>
        <div style={styles.mainContent}>
          <div style={styles.infoSection}>
            <h1 style={styles.title}>{property.title}</h1>
            <p style={styles.location}>📍 {property.location}</p>
            <div style={styles.hostInfo}>
              <div style={styles.hostAvatar}>👤</div>
              <div>
                <p style={styles.hostLabel}>Hosted by</p>
                <p style={styles.hostName}>{ownerName}</p>
              </div>
            </div>
            
            <div style={styles.description}>
              <h3>About this place</h3>
              <p>{property.description}</p>
            </div>
          </div>

          <div style={styles.reviewsSection}>
            <h2 style={styles.sectionTitle}>
              Reviews <span style={styles.reviewCount}>({reviews.length})</span>
            </h2>
            
            {reviews.length === 0 ? (
              <p style={styles.noReviews}>No reviews yet. Be the first to review!</p>
            ) : (
              <div style={styles.reviewsList}>
                {reviews.map(r => {
                  const reviewerName = typeof r.user === 'string' ? 'User' : r.user.name;
                  return (
                    <div key={r._id} style={styles.reviewCard}>
                      <div style={styles.reviewHeader}>
                        <div style={styles.reviewerAvatar}>
                          {reviewerName[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p style={styles.reviewerName}>{reviewerName}</p>
                          <div style={styles.stars}>{'⭐'.repeat(r.rating)}</div>
                        </div>
                      </div>
                      <p style={styles.reviewComment}>{r.comment}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {user && (
              <form onSubmit={submitReview} style={styles.reviewForm}>
                <h3>Leave a Review</h3>
                <div style={styles.formGroup}>
                  <label>Rating</label>
                  <select 
                    value={reviewForm.rating} 
                    onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  >
                    {[1,2,3,4,5].map(n => (
                      <option key={n} value={n}>{n} star{n>1?'s':''}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label>Comment</label>
                  <textarea 
                    placeholder="Share your experience..."
                    value={reviewForm.comment} 
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} 
                    rows={4}
                    required 
                  />
                </div>
                <button type="submit">Submit Review</button>
              </form>
            )}
          </div>
        </div>

        <div style={styles.bookingCard}>
          <div style={styles.bookingHeader}>
            <span style={styles.bookingPrice}>${property.pricePerNight}</span>
            <span style={styles.bookingUnit}> / night</span>
          </div>
          
          {user ? (
            <div style={styles.bookingForm}>
              <div style={styles.dateGroup}>
                <label>CHECK-IN</label>
                <input 
                  type="date" 
                  name="checkIn"
                  value={dates.checkIn} 
                  onChange={handleDateChange}
                />
              </div>
              <div style={styles.dateGroup}>
                <label>CHECK-OUT</label>
                <input 
                  type="date" 
                  name="checkOut"
                  value={dates.checkOut} 
                  onChange={handleDateChange}
                />
              </div>
              <button onClick={book} style={styles.bookButton}>
                Reserve Now
              </button>
            </div>
          ) : (
            <p style={styles.loginPrompt}>
              <a href="/login">Log in</a> to book this property
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  loading: { textAlign: 'center', padding: '4rem', fontSize: '1.5rem' },
  imageSection: { marginBottom: '2rem' },
  mainImage: {
    width: '100%',
    height: '500px',
    objectFit: 'cover',
    borderRadius: '16px'
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '3rem'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  infoSection: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  title: { fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' },
  location: { fontSize: '1.1rem', color: '#666', marginBottom: '1.5rem' },
  hostInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    background: '#f7f7f7',
    borderRadius: '12px',
    marginBottom: '1.5rem'
  },
  hostAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#ff385c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem'
  },
  hostLabel: { fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' },
  hostName: { fontSize: '1.1rem', fontWeight: '600' },
  description: { lineHeight: '1.6' },
  reviewsSection: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  sectionTitle: { fontSize: '1.75rem', marginBottom: '1.5rem' },
  reviewCount: { color: '#666', fontWeight: 'normal' },
  noReviews: { color: '#666', fontStyle: 'italic' },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  reviewCard: {
    padding: '1.5rem',
    background: '#f7f7f7',
    borderRadius: '12px'
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem'
  },
  reviewerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  },
  reviewerName: { fontWeight: '600', marginBottom: '0.25rem' },
  stars: { fontSize: '0.9rem' },
  reviewComment: { lineHeight: '1.6', color: '#444' },
  reviewForm: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f7f7f7',
    borderRadius: '12px'
  },
  formGroup: { marginBottom: '1rem' },
  bookingCard: {
    position: 'sticky',
    top: '100px',
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    height: 'fit-content'
  },
  bookingHeader: { marginBottom: '1.5rem' },
  bookingPrice: { fontSize: '1.75rem', fontWeight: 'bold' },
  bookingUnit: { fontSize: '1rem', color: '#666' },
  bookingForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  dateGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  bookButton: {
    background: 'linear-gradient(135deg, #ff385c 0%, #e31c5f 100%)',
    color: 'white',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    marginTop: '0.5rem'
  },
  loginPrompt: {
    textAlign: 'center',
    padding: '1rem',
    background: '#f7f7f7',
    borderRadius: '8px'
  }
};