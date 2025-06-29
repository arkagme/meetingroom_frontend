import { useState, useEffect } from 'react';
import { createBooking, getRoomAvailability } from '../services/api';

function BookingModal({ room, user, onClose }) {
  const [formData, setFormData] = useState({
    meetingTitle: '',
    startTime: '',
    endTime: '',
    attendeesCount: 1,
    selectedEquipment: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingBookings, setExistingBookings] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchRoomAvailability();
  }, [room.id]);

  const fetchRoomAvailability = async () => {
    try {
      const bookings = await getRoomAvailability(room.id, today);
      setExistingBookings(bookings);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'equipment') {
        setFormData(prev => ({
          ...prev,
          selectedEquipment: checked 
            ? [...prev.selectedEquipment, value]
            : prev.selectedEquipment.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateBookingTime = () => {
    const start = new Date(`${today}T${formData.startTime}`);
    const end = new Date(`${today}T${formData.endTime}`);
    const now = new Date();

    if (start <= now) {
      setError('Cannot book for past time slots');
      return false;
    }

    const startHour = start.getHours();
    const endHour = end.getHours();
    const endMinutes = end.getMinutes();

    if (startHour < 9 || (endHour > 20) || (endHour === 20 && endMinutes > 0)) {
      setError('Bookings are only allowed between 9 AM and 8 PM');
      return false;
    }

    const duration = (end - start) / (1000 * 60); // in minutes
    if (duration < 30) {
      setError('Minimum booking duration is 30 minutes');
      return false;
    }

    if (duration > 300) {
      setError('Maximum booking duration is 5 hours');
      return false;
    }

    const hasConflict = existingBookings.some(booking => {
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);
      
      return (
        (start <= bookingStart && end > bookingStart) ||
        (start < bookingEnd && end >= bookingEnd) ||
        (start >= bookingStart && end <= bookingEnd)
      );
    });

    if (hasConflict) {
      setError('Time slot conflicts with existing booking');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateBookingTime()) {
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        userId: user.id,
        roomId: room.id,
        meetingTitle: formData.meetingTitle,
        startTime: `${today}T${formData.startTime}:00`,
        endTime: `${today}T${formData.endTime}:00`,
        attendeesCount: parseInt(formData.attendeesCount),
        selectedEquipment: formData.selectedEquipment
      };

      const response = await createBooking(bookingData);
      
      if (response.success) {
        setSuccess('Booking created successfully!');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>Book {room.name}</h2>
        
        <div className="room-info">
          <p><strong>Capacity:</strong> {room.capacity} people</p>
          <p><strong>Available Equipment:</strong> {room.equipment.join(', ')}</p>
        </div>

        {existingBookings.length > 0 && (
          <div className="existing-bookings">
            <h4>Today's Bookings:</h4>
            {existingBookings.map((booking, index) => (
              <div key={index} className="booking-slot">
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}: {booking.meeting_title}
              </div>
            ))}
          </div>
        )}

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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="meetingTitle">Meeting Title</label>
            <input
              type="text"
              id="meetingTitle"
              name="meetingTitle"
              value={formData.meetingTitle}
              onChange={handleChange}
              required
              placeholder="Enter meeting title"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                min="09:00"
                max="20:00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                min="09:30"
                max="20:00"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="attendeesCount">Number of Attendees</label>
            <input
              type="number"
              id="attendeesCount"
              name="attendeesCount"
              value={formData.attendeesCount}
              onChange={handleChange}
              min="1"
              max={room.capacity}
              required
            />
          </div>

          <div className="equipment-section">
            <h4>Required Equipment:</h4>
            <div className="equipment-checkboxes">
              {room.equipment.map((equipment, index) => (
                <label key={index} className="equipment-checkbox">
                  <input
                    type="checkbox"
                    name="equipment"
                    value={equipment}
                    checked={formData.selectedEquipment.includes(equipment)}
                    onChange={handleChange}
                  />
                  {equipment}
                </label>
              ))}
            </div>
          </div>

          <div className="booking-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Booking...' : 'Book Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;