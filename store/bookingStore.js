import { create } from 'zustand';

export const useBookingStore = create((set, get) => ({
  search: { from: '', to: '', fromName: '', toName: '', date: '', passengers: 1, tripType: 'one-way' },
  setSearch: (fields) => set(s => ({ search: { ...s.search, ...fields } })),

  selectedTrip: null,
  setSelectedTrip: (trip) => set({ selectedTrip: trip, selectedSeats: [] }),

  selectedSeats: [],
  toggleSeat: (seatNumber) => set(s => {
    const { selectedSeats, search } = s;
    if (selectedSeats.includes(seatNumber))
      return { selectedSeats: selectedSeats.filter(n => n !== seatNumber) };
    if (selectedSeats.length >= search.passengers) return s;
    return { selectedSeats: [...selectedSeats, seatNumber] };
  }),
  clearSeats: () => set({ selectedSeats: [] }),

  extraBags: 0,
  setExtraBags: (n) => set({ extraBags: Math.max(0, n) }),

  paymentMethod: 'cash',
  setPaymentMethod: (m) => set({ paymentMethod: m }),

  confirmedBooking: null,
  setConfirmedBooking: (b) => set({ confirmedBooking: b }),

  getTotalFare: () => {
    const { selectedTrip, selectedSeats, extraBags } = get();
    if (!selectedTrip) return 0;
    return (selectedTrip.fare_standard * selectedSeats.length) + (extraBags * 1500);
  },

  reset: () => set({
    search: { from: '', to: '', fromName: '', toName: '', date: '', passengers: 1, tripType: 'one-way' },
    selectedTrip: null, selectedSeats: [], extraBags: 0,
    paymentMethod: 'cash', confirmedBooking: null,
  }),
}));
