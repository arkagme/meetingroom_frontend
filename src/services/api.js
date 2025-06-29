import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginUser = async (name, email) => {
  const response = await api.post('/auth/login', { name, email });
  return response.data;
};
export const getRooms = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

export const getRoomAvailability = async (roomId, date) => {
  const response = await api.get(`/rooms/${roomId}/availability?date=${date}`);
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getUserBookings = async (userId) => {
  const response = await api.get(`/users/${userId}/bookings`);
  return response.data;
};

export const cancelBooking = async (bookingId, userId) => {
  const response = await api.delete(`/bookings/${bookingId}`, {
    data: { userId }
  });
  return response.data;
};

export const getTodayBookings = async () => {
  const response = await api.get('/bookings/today');
  return response.data;
};

export default api;