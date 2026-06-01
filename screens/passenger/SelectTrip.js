import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../store/bookingStore';
import LangToggle from '../../components/LangToggle';
import { searchTrips } from '../../api';

const MOCK_TRIPS = [
  { id: 'trip-001', depart_time: '06:00', arrive_time: '11:30', duration_minutes: 330, booked_seats: 64, total_seats: 75, fare_standard: 6000, fare_vip: 9500, bus_code: 'GE-101', bus_type: 'classic' },
  { id: 'trip-002', depart_time: '10:30', arrive_time: '16:00', duration_minutes: 330, booked_seats: 58, total_seats: 75, fare_standard: 6000, fare_vip: 9500, bus_code: 'GE-102', bus_type: 'classic' },
  { id: 'trip-003', depart_time: '14:00', arrive_time: '19:30', duration_minutes: 330, booked_seats: 30, total_seats: 62, fare_standard: 9500, fare_vip: 9500, bus_code: 'GE-201', bus_type: 'vip' },
];

function OccupancyBar({ booked, total }) {
  const pct = Math.round((booked / total) * 100);
  const avail = total - booked;
  const color = pct >= 90 ? '#E24B4A' : pct >= 75 ? '#EF9F27' : '#3DB34A';
  return (
    <View style={{ marginVertical: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 11, fontWeight: '500', color }}>{pct}% Full — {avail} Seats Available</Text>
        <Text style={{ fontSize: 11, color: '#ADADAA' }}>{pct}%</Text>
      </View>
      <View style={{ height: 5, backgroundColor: '#EFEFED', borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

export default function SelectTrip({ navigation }) {
  const { t } = useTranslation();
  const { search, setSelectedTrip } = useBookingStore();
  const [active, setActive] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    searchTrips(search.from, search.to, search.date, search.passengers)
      .then(res => {
        const data = res.data.trips || [];
        setTrips(data.length > 0 ? data : MOCK_TRIPS);
        setLoading(false);
      })
      .catch(() => {
        setTrips(MOCK_TRIPS);
        setLoading(false);
      });
  }, [search.from, search.to, search.date]);

  function select(trip) {
    setActive(trip.id);
    setSelectedTrip(trip);
  }

  const chosen = trips.find(tr => tr.id === active);

  return (
    <SafeAreaView style={s.shell}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← {t('back')}</Text>
          </TouchableOpacity>
          <Text style={s.title}>{t('selectTrip')}</Text>
          <Text style={s.subtitle}>{search.fromName} → {search.toName}</Text>
        </View>
        <LangToggle />
      </View>

      <View style={s.context}>
        <Text style={s.contextRoute}>{search.fromName} → {search.toName}</Text>
        <Text style={s.contextMeta}>{search.date} · {search.passengers} {search.passengers > 1 ? t('passenger_other') : t('passenger_one')}</Text>
      </View>

      <ScrollView style={s.body} contentContainerStyle={{ gap: 10 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator color="#3DB34A" size="large" />
          </View>
        ) : (
          trips.map(trip => (
            <TouchableOpacity
              key={trip.id}
              style={[s.tripCard, trip.id === active && s.tripCardActive]}
              onPress={() => select(trip)}
              activeOpacity={0.85}
            >
              <View style={s.times}>
                <View>
                  <Text style={s.time}>{trip.depart_time}</Text>
                  <Text style={s.timeLabel}>{t('depart')}</Text>
                </View>
                <Text style={s.arrow}>→</Text>
                <View>
                  <Text style={s.time}>{trip.arrive_time}</Text>
                  <Text style={s.timeLabel}>{t('arrive')}</Text>
                </View>
                <View style={s.durBlock}>
                  <Text style={s.durLabel}>⏱ {t('totalDuration')}</Text>
                  <Text style={s.durVal}>
                    {Math.floor(trip.duration_minutes/60)}h {trip.duration_minutes%60}m
                  </Text>
                </View>
              </View>
              <OccupancyBar booked={parseInt(trip.booked_seats)} total={parseInt(trip.total_seats)} />
              <Text style={s.fareLabel}>{t('oneWayFare')}</Text>
              <Text style={s.fareVal}>FCFA {parseInt(trip.fare_standard).toLocaleString()}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={s.footer}>
        {chosen && (
          <Text style={s.stickyTrip}>
            {chosen.depart_time} → {chosen.arrive_time} · {search.passengers} {search.passengers > 1 ? t('passenger_other') : t('passenger_one')}
          </Text>
        )}
        <TouchableOpacity
          style={[s.btn, !active && s.btnDisabled]}
          onPress={() => active && navigation.navigate('SeatMap')}
          activeOpacity={active ? 0.85 : 1}
        >
          <Text style={s.btnText}>{t('selectSeats')} →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell:          { flex: 1, backgroundColor: '#F7F7F5' },
  header:         { backgroundColor: '#fff', padding: 14, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#EFEFED', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  backText:       { fontSize: 14, color: '#3DB34A', fontWeight: '500', marginBottom: 6 },
  title:          { fontSize: 17, fontWeight: '600', color: '#111110' },
  subtitle:       { fontSize: 11, color: '#ADADAA', marginTop: 1 },
  context:        { backgroundColor: '#fff', padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#EFEFED' },
  contextRoute:   { fontSize: 14, fontWeight: '600', color: '#111110' },
  contextMeta:    { fontSize: 12, color: '#ADADAA', marginTop: 2 },
  body:           { flex: 1, padding: 14 },
  tripCard:       { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#EFEFED', borderRadius: 16, padding: 14 },
  tripCardActive: { borderColor: '#3DB34A', backgroundColor: '#FAFEF8' },
  times:          { flexDirection: 'row', alignItems: 'center', gap: 10 },
  time:           { fontSize: 22, fontWeight: '600', color: '#111110' },
  timeLabel:      { fontSize: 9, color: '#ADADAA', marginTop: 2, letterSpacing: 0.5 },
  arrow:          { fontSize: 14, color: '#ADADAA', paddingBottom: 10 },
  durBlock:       { marginLeft: 'auto', alignItems: 'flex-end' },
  durLabel:       { fontSize: 10, color: '#ADADAA' },
  durVal:         { fontSize: 13, fontWeight: '500', color: '#737370', marginTop: 2 },
  fareLabel:      { fontSize: 9, color: '#ADADAA', letterSpacing: 0.5 },
  fareVal:        { fontSize: 16, fontWeight: '600', color: '#111110', marginTop: 2 },
  footer:         { padding: 14, paddingBottom: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EFEFED', gap: 8 },
  stickyTrip:     { fontSize: 12, color: '#737370', textAlign: 'center' },
  btn:            { backgroundColor: '#3DB34A', borderRadius: 14, padding: 15, alignItems: 'center' },
  btnDisabled:    { backgroundColor: '#9fd4a5' },
  btnText:        { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
});
