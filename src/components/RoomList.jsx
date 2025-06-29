import { useState } from 'react';
import BookingModal from './BookingModal';

function RoomList({ rooms, user }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedRoom(null);
  };

  return (
    <div className="room-list">
      <div className="rooms-grid">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="room-card"
            onClick={() => handleRoomClick(room)}
          >
            <h3>{room.name}</h3>
            <div className="room-info">
              <div className="capacity">
                <span>👥 {room.capacity} people</span>
              </div>
            </div>
            <div className="equipment-list">
              {room.equipment.map((equipment, index) => (
                <span key={index} className="equipment-tag">
                  {equipment}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showBookingModal && selectedRoom && (
        <BookingModal
          room={selectedRoom}
          user={user}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default RoomList;