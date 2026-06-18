import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyTickets({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await AsyncStorage.getItem('my_tickets');
      if (data) setTickets(JSON.parse(data));
    } catch (e) {}
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  function status(t) {
    if (t.scanned_at) return { label: 'Used', color: '#ADADAA', bg: '#F7F7F5' };
    const d = (t.date || t.trip_date) ? new Date(t.date || t.trip_date) : null;
    if (d && d < new Date()) return { label: 'Expired', color: '#E24B4A', bg: '#FCEBEB' };
    return { label: 'Active', color: '#27500A', bg: '#EAF3DE' };
  }

  function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <SafeAreaView style={s.shell}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>My Tickets</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={s.body} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3DB34A" />}>
        {tickets.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🎫</Text>
            <Text style={s.emptyText}>No tickets yet</Text>
            <Text style={s.emptySub}>Your booked tickets will appear here</Text>
          </View>
        )}
        {tickets.map((t, i) => {
          const st = status(t);
          return (
            <View key={t.ref || i} style={s.card}>
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.route}>{t.from || t.origin_name || 'Douala'} → {t.to || t.destination_name || 'Yaoundé'}</Text>
                  <Text style={s.date}>{fmtDate(t.date || t.trip_date)} · {(t.time || t.depart_time)?.slice(0,5)}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: st.bg }]}>
                  <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <View style={s.div} />
              <View style={s.row}>
                <View><Text style={s.lbl}>REF</Text><Text style={s.ref}>{t.ref}</Text></View>
                <View><Text style={s.lbl}>SEAT</Text><Text style={s.val}>{t.seats?.[0] || t.seat_number || '—'}</Text></View>
                <View><Text style={s.lbl}>FARE</Text><Text style={s.val}>FCFA {(t.fare || t.fare_paid)?.toLocaleString()}</Text></View>
              </View>
              {(t.qr_payload || t.ref) && (
                <View style={s.qrWrap}>
                  <View style={{ borderWidth: 1, borderColor: '#EFEFED', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#111110', marginBottom: 4 }}>{t.qr_payload || t.ref}</Text>
                    <Text style={s.qrHint}>Show at boarding gate</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell:    { flex: 1, backgroundColor: '#F7F7F5' },
  header:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 14, borderBottomWidth: 1, borderBottomColor: '#EFEFED' },
  back:     { fontSize: 14, color: '#3DB34A', fontWeight: '500', width: 60 },
  title:    { fontSize: 17, fontWeight: '600', color: '#111110' },
  body:     { flex: 1, padding: 14 },
  empty:    { alignItems: 'center', paddingTop: 60 },
  emptyIcon:{ fontSize: 48, marginBottom: 12 },
  emptyText:{ fontSize: 16, fontWeight: '600', color: '#111110', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#ADADAA' },
  card:     { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EFEFED', padding: 14, marginBottom: 12 },
  row:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  route:    { fontSize: 15, fontWeight: '600', color: '#111110' },
  date:     { fontSize: 12, color: '#737370', marginTop: 2 },
  badge:    { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:{ fontSize: 11, fontWeight: '600' },
  div:      { height: 1, backgroundColor: '#EFEFED', marginVertical: 10 },
  lbl:      { fontSize: 10, color: '#ADADAA', letterSpacing: 0.5, marginBottom: 2 },
  ref:      { fontSize: 13, fontWeight: '700', color: '#111110' },
  val:      { fontSize: 13, fontWeight: '500', color: '#111110' },
  qrWrap:   { alignItems: 'center', marginTop: 12 },
  qr:       { width: 140, height: 140 },
  qrHint:   { fontSize: 11, color: '#ADADAA', marginTop: 4 },
});
