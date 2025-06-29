import { useState, useEffect } from 'react';
import { getTodayBookings } from '../services/api';

function Timeline({ rooms }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayBookings();
  }, []);

  const fetchTodayBookings = async () => {
    try {
      const bookingsData = await getTodayBookings();
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 22) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const timeToSlotIndex = (timeString) => {
    const time = new Date(timeString);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    
    if (hours < 9 || hours >= 22) return -1;
    
    const slotIndex = (hours - 9) * 2 + (minutes >= 30 ? 1 : 0);
    return slotIndex;
  };

  const getBookingSpans = (roomId) => {
    const roomBookings = bookings.filter(booking => booking.room_id === roomId);
    const spans = [];
    
    roomBookings.forEach(booking => {
      const startSlot = timeToSlotIndex(booking.start_time);
      const endSlot = timeToSlotIndex(booking.end_time);
      
      if (startSlot !== -1) {
        const maxSlots = timeSlots.length - startSlot;
        let span = 1;
        
        if (endSlot !== -1 && endSlot > startSlot) {
          span = Math.min(endSlot - startSlot, maxSlots);
        } else if (endSlot === -1) {
          span = maxSlots;
        }
        
        spans.push({
          startSlot,
          span,
          booking
        });
      }
    });
    
    return spans;
  };

  const isSlotOccupied = (roomId, slotIndex, bookingSpans) => {
    return bookingSpans.some(span => 
      slotIndex >= span.startSlot && slotIndex < span.startSlot + span.span
    );
  };

  const timeSlots = generateTimeSlots();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>Today's Schedule - {new Date().toLocaleDateString('en-GB')}</h2>
      </div>
      
      <div className="timeline-wrapper">
        <div className="timeline-grid">
          <div className="timeline-row timeline-header-row">
            <div className="room-header">Room</div>
            {timeSlots.map(slot => (
              <div key={slot} className="time-header">
                {slot}
              </div>
            ))}
          </div>

          {rooms.map(room => {
            const bookingSpans = getBookingSpans(room.id);
            
            return (
              <div key={room.id} className="timeline-row">
                <div className="room-name">
                  {room.name}
                </div>
                
                {timeSlots.map((slot, slotIndex) => {
                  const bookingSpan = bookingSpans.find(span => span.startSlot === slotIndex);
                  const isOccupied = isSlotOccupied(room.id, slotIndex, bookingSpans);
                  
                  if (bookingSpan) {
                    return (
                      <div
                        key={`${room.id}-${slot}`}
                        className="time-slot booking-span"
                        style={{ 
                          gridColumn: `span ${bookingSpan.span}`,
                          backgroundColor: '#6366f1',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          textAlign: 'center',
                          padding: '4px'
                        }}
                        title={`${bookingSpan.booking.meeting_title} (${bookingSpan.booking.user_name})`}
                      >
                        <div>
                          <div>{bookingSpan.booking.meeting_title}</div>
                          <small>{bookingSpan.booking.user_name}</small>
                        </div>
                      </div>
                    );
                  } else if (isOccupied) {
                    return null;
                  } else {
                    return (
                      <div
                        key={`${room.id}-${slot}`}
                        className="time-slot empty-slot"
                        title="Available"
                      >
                      </div>
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
      </div>

      {bookings.length === 0 && (
        <div className="alert alert-info">
          No bookings for today.
        </div>
      )}

      <style jsx>{`
        .timeline-container {
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          width: 100%;
        }

        .timeline-header h2 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 24px;
        }

        .timeline-wrapper {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow-x: auto;
          overflow-y: visible;
          width: 100%;
        }

        .timeline-grid {
          display: flex;
          flex-direction: column;
          width: fit-content;
          min-width: 100%;
        }

        .timeline-row {
          display: grid;
          grid-template-columns: 150px repeat(${timeSlots.length}, 80px);
          min-height: 60px;
        }

        .room-header {
          position: sticky;
          left: 0;
          z-index: 11;
          background: #6366f1;
          width: 150px;
        }

        .timeline-header-row {
          background: #6366f1;
          color: white;
          font-weight: bold;
          position: sticky;
          top: 0;
          z-index: 12;
        }

        .room-header, .time-header {
          padding: 12px 8px;
          border-right: 1px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          white-space: nowrap;
        }

        .time-header {
          width: 80px;
        }

        .room-name {
          padding: 12px;
          background: #f9fafb;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          font-weight: 500;
          color: #374151;
          position: sticky;
          left: 0;
          z-index: 10;
          width: 150px;
        }

        .time-slot {
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          position: relative;
          min-height: 60px;
          width: 80px;
        }

        .empty-slot {
          background: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .empty-slot:hover {
          background: #f3f4f6;
        }

        .booking-span {
          border-radius: 4px;
          margin: 4px;
          border: none !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .alert {
          padding: 16px;
          margin: 20px 0;
          border-radius: 6px;
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }
      `}</style>
    </div>
  );
}

export default Timeline;