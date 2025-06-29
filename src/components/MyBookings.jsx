import { useState, useEffect } from 'react';
import { getUserBookings, cancelBooking } from '../services/api';

function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserBookings();
  }, [user.id]);

const fetchUserBookings = async () => {
  try {
    const response = await getUserBookings(user.id);
    setBookings(response.bookings); // Access the bookings array
  } catch (error) {
    console.error('Error fetching bookings:', error);
    setError('Failed to load bookings');
  } finally {
    setLoading(false);
  }
};

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking(bookingId, user.id);
      setSuccess('Booking cancelled successfully');
      
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError(error.response?.data?.error || 'Failed to cancel booking');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const isBookingCancellable = (startTime) => {
    const bookingStart = new Date(startTime);
    const now = new Date();
    return bookingStart > now;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="alert alert-info">
          You have no bookings yet.
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => {
            const startDateTime = formatDateTime(booking.start_time);
            const endDateTime = formatDateTime(booking.end_time);
            const canCancel = isBookingCancellable(booking.start_time);

            return (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.meeting_title}</h3>
                  <span className={`status ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="booking-details">
                  <p><strong>Room:</strong> {booking.room_name}</p>
                  <p><strong>Date:</strong> {startDateTime.date}</p>
                  <p><strong>Time:</strong> {startDateTime.time} - {endDateTime.time}</p>
                  <p><strong>Attendees:</strong> {booking.attendees_count}</p>
                  {booking.selected_equipment && (
                    <p><strong>Equipment:</strong> {booking.selected_equipment.join(' , ')}</p>
                  )}
                </div>

                {canCancel &&  (
                  <div className="booking-actions">
                    <button
                    type='button'
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn btn-danger"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}

                {!canCancel && (
                  <div className="booking-note">
                    <small>This booking cannot be cancelled (already started or in the past)</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookings;