import { useState, useEffect } from 'react';
import RoomList from './RoomList';
import Timeline from './Timeline';
import MyBookings from './MyBookings';
import { getRooms } from '../services/api';

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const roomsData = await getRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-error">
          {error}
        </div>
      );
    }

    switch (activeTab) {
      case 'rooms':
        return <RoomList rooms={rooms} user={user} />;
      case 'timeline':
        return <Timeline rooms={rooms} />;
      case 'bookings':
        return <MyBookings user={user} />;
      default:
        return <RoomList rooms={rooms} user={user} />;
    }
  };

  return (
    <div className="dashboard">
      <div className="header">
        <div className="container">
          <div className="header-content">
            <h1>Meeting Room Booking System</h1>
            <div className="user-info">
              <span>Welcome, {user.name}</span>
              <button type='button' className="logout-btn" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="nav-tabs">
          <button
           type='button'
            className={`nav-tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            Book Rooms
          </button>
          <button
          type='button'
            className={`nav-tab ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline View
          </button>
          <button
          type='button'
            className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;