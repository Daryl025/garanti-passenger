import axios from 'axios';

const BASE_URL = 'https://sweet-patience-production.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;

export const searchTrips = (origin, destination, date, passengers) =>
  api.get(`/api/trips/search?origin=${origin}&destination=${destination}&date=${date}&passengers=${passengers}`);

export const getTripSeats = (tripId) =>
  api.get(`/api/trips/${tripId}/seats`);

export const lockSeats = (tripId, seatNumbers, sessionId) =>
  api.post(`/api/trips/${tripId}/seats/lock`, { seat_numbers: seatNumbers, session_id: sessionId });

export const bookTicket = (data) =>
  api.post('/api/tickets/book', data);

export const getTerminals = () =>
  api.get('/api/terminals');
