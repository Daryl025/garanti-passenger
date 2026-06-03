import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../store/bookingStore';
import LangToggle from '../../components/LangToggle';
import { getTripSeats } from '../../api';

export default function SeatMap({ navigation }) {
  const { t } = useTranslation();
  const { selectedTrip, selectedSeats, search, toggleSeat } = useBookingStore();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busType, setBusType] = useState('classic');

  useEffect(() => {
    if (!selectedTrip) return;
    setLoading(true);
    getTripSeats(selectedTrip.id)
      .then(res => {
        setSeats(res.data.seats || []);
        setBusType(res.data.bus_type || 'classic');
        setLoading(false);
      })
      .catch(() => {
        // fallback to generated seats
        setSeats(generateSeats(selectedTrip.total_seats, selectedTrip.booked_seats, selectedTrip.bus_type));
        setBusType(selectedTrip.bus_type || 'classic');
        setLoading(false);
      });
  }, [selectedTrip]);

  function generateSeats(totalSeats, bookedCount, type) {
    const cols = type === 'vip' ? ['A','B','C','D'] : ['A','B','C','D','E'];
    const rows = Math.ceil(totalSeats / cols.length);
    const result = [];
    const allIds = [];
    for (let r = 1; r <= rows; r++)
      for (const c of cols) allIds.push(`${r}${c}`);
    const taken = new Set();
    for (let i = 0; i < bookedCount && i < allIds.length; i++)
      taken.add(allIds[(i * 7 + 3) % allIds.length]);
    for (let r = 1; r <= rows; r++)
      for (const c of cols) {
        const id = `${r}${c}`;
        if (result.length >= totalSeats) break;
        result.push({ seat_number: id, seat_row: r, seat_col: c, status: taken.has(id) ? 'booked' : 'free' });
      }
    return result;
  }

  const rows = [...new Set(seats.map(s => s.seat_row))].sort((a,b) => a-b);
  const isVip = busType === 'vip';
  const leftCols  = ['A','B'];
  const rightCols = isVip ? ['C','D'] : ['C','D','E'];
  const required  = search.passengers;
  const canContinue = selectedSeats.length === required;

  function getSeatStatus(seat) {
    if (seat.status === 'booked' || seat.status === 'locked') return 'taken';
    if (selectedSeats.includes(seat.seat_number)) return 'selected';
    return 'free';
  }

  return (
    <SafeAreaView style={s.shell}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← {t('back')}</Text>
          </TouchableOpacity>
          <Text style={s.title}>{t('selectSeatsTitle')}</Text>
          <Text style={s.subtitle}>Screen C · Seating Canvas</Text>
        </View>
        <LangToggle />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#3DB34A" size="large" />
          <Text style={{ color: '#ADADAA', marginTop: 12, fontSize: 13 }}>Loading seats...</Text>
        </View>
      ) : (
        <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
          <Text style={s.counter}>{selectedSeats.length} / {required} {t('seatsSelected')}</Text>

          <View style={s.legend}>
            {[
              { color: '#378ADD', label: t('freeAvailable') },
              { color: '#E24B4A', label: t('reserved') },
              { color: '#3DB34A', label: t('yourSelection') },
            ].map(item => (
              <View key={item.label} style={s.legendRow}>
                <View style={[s.legendSeat, { backgroundColor: item.color }]} />
                <Text style={s.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={s.bus}>
            <View style={s.cabinLabel}>
              <Text style={s.cabinText}>{t('driverCabin')}</Text>
            </View>
            {rows.map(row => {
              const rowSeats = seats.filter(seat => seat.seat_row === row);
              const left  = rowSeats.filter(seat => leftCols.includes(seat.seat_col));
              const right = rowSeats.filter(seat => rightCols.includes(seat.seat_col));
              return (
                <View key={row} style={s.seatRow}>
                  <Text style={s.rowNum}>{row}</Text>
                  {left.map(seat => {
                    const st = getSeatStatus(seat);
                    return (
                      <TouchableOpacity
                        key={seat.seat_number}
                        style={[s.seat, s[`seat_${st}`]]}
                        onPress={() => st !== 'taken' && toggleSeat(seat.seat_number)}
                        disabled={st === 'taken'}
                        activeOpacity={0.7}
                      >
                        <Text style={s.seatText}>{seat.seat_number}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={s.aisle} />
                  {right.map(seat => {
                    const st = getSeatStatus(seat);
                    return (
                      <TouchableOpacity
                        key={seat.seat_number}
                        style={[s.seat, s[`seat_${st}`]]}
                        onPress={() => st !== 'taken' && toggleSeat(seat.seat_number)}
                        disabled={st === 'taken'}
                        activeOpacity={0.7}
                      >
                        <Text style={s.seatText}>{seat.seat_number}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.btn, !canContinue && s.btnDisabled]}
          onPress={() => canContinue && navigation.navigate('PassengerDetails')}
          activeOpacity={canContinue ? 0.85 : 1}
        >
          <Text style={s.btnText}>{t('confirmSeats')} →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell:       { flex: 1, backgroundColor: '#F7F7F5' },
  header:      { backgroundColor: '#fff', padding: 14, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#EFEFED', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  backText:    { fontSize: 14, color: '#3DB34A', fontWeight: '500', marginBottom: 6 },
  title:       { fontSize: 17, fontWeight: '600', color: '#111110' },
  subtitle:    { fontSize: 11, color: '#ADADAA', marginTop: 1 },
  body:        { flex: 1, padding: 12 },
  counter:     { fontSize: 12, fontWeight: '600', color: '#737370', letterSpacing: 0.5, marginBottom: 10 },
  legend:      { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#EFEFED', padding: 10, marginBottom: 10, gap: 6 },
  legendRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#F7F7F5' },
  legendSeat:  { width: 24, height: 24, borderRadius: 6 },
  legendText:  { fontSize: 12, color: '#333331' },
  bus:         { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#EFEFED', padding: 10, alignItems: 'center' },
  cabinLabel:  { backgroundColor: '#F7F7F5', borderRadius: 6, padding: 6, alignItems: 'center', marginBottom: 8, width: '100%' },
  cabinText:   { fontSize: 10, fontWeight: '600', color: '#ADADAA', letterSpacing: 0.8 },
  seatRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, justifyContent: 'center' },
  rowNum:      { fontSize: 10, color: '#DDDDD9', width: 20, textAlign: 'right' },
  aisle:       { width: 16 },
  seat:        { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  seat_free:     { backgroundColor: '#378ADD' },
  seat_taken:    { backgroundColor: '#E24B4A' },
  seat_selected: { backgroundColor: '#3DB34A' },
  seatText:    { fontSize: 9, fontWeight: '700', color: '#fff' },
  footer:      { padding: 14, paddingBottom: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EFEFED' },
  btn:         { backgroundColor: '#3DB34A', borderRadius: 14, padding: 15, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#9fd4a5' },
  btnText:     { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
});
