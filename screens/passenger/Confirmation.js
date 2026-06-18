import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
let QRCode = null;
try { QRCode = require('react-native-qrcode-svg').default; } catch (e) {}
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBookingStore } from '../../store/bookingStore';
import LangToggle from '../../components/LangToggle';



export default function Confirmation({ navigation }) {
  const { t } = useTranslation();
  const { confirmedBooking, reset } = useBookingStore();

  if (!confirmedBooking) {
    navigation.replace('SearchTrip');
    return null;
  }

  const b = confirmedBooking;

  React.useEffect(() => {
    if (!b) return;
    AsyncStorage.getItem('my_tickets').then(data => {
      const list = data ? JSON.parse(data) : [];
      if (!list.find(t => t.ref === b.ref)) {
        AsyncStorage.setItem('my_tickets', JSON.stringify([b, ...list.slice(0, 49)]));
      }
    });
  }, [b?.ref]);

  return (
    <SafeAreaView style={s.shell}>
      <View style={s.header}>
        <View style={s.headerIcon}><Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>✓</Text></View>
        <View>
          <Text style={s.headerTitle}>{t('bookingConfirmed')}</Text>
          <Text style={s.headerSub}>Screen E · Tickets</Text>
        </View>
        <LangToggle />
      </View>
      <ScrollView style={s.body} contentContainerStyle={{ gap: 12 }} showsVerticalScrollIndicator={false}>
        <View style={s.ticketCard}>
          <View style={s.ticketHeader}>
            <View>
              <Text style={s.ticketNum}>{t('ticket')} #1</Text>
              <Text style={s.ticketSeat}>{t('seat')} {b.seats[0]}</Text>
            </View>
            <View style={s.ticketAvatar}><Text style={{ fontSize: 18 }}>👤</Text></View>
          </View>
          <View style={s.ticketBody}>
            <Text style={s.passengerName}>{b.passenger}</Text>
            <View style={s.ticketGrid}>
              <View>
                <Text style={s.tLabel}>📍 {t('departureTerminalLabel')}</Text>
                <Text style={s.tVal}>{b.from}</Text>
              </View>
              <View>
                <Text style={s.tLabel}>🏁 {t('destination')}</Text>
                <Text style={s.tVal}>{b.to}</Text>
              </View>
              <View>
                <Text style={s.tLabel}>📅 {t('departureDateLabel')}</Text>
                <Text style={s.tVal}>{b.date}</Text>
              </View>
              <View>
                <Text style={s.tLabel}>⏰ {t('scheduledTime')}</Text>
                <Text style={s.tVal}>{b.time}</Text>
              </View>
            </View>
            <Text style={s.tLabel}>{t('assignedSeat')}</Text>
            <View style={s.seatBadge}><Text style={s.seatBadgeText}>{b.seats[0]}</Text></View>
            <Text style={[s.tLabel, { marginTop: 10 }]}>{t('totalCost')}</Text>
            <Text style={s.costVal}>FCFA {b.fare.toLocaleString()}</Text>
            <View style={s.qrBox}>
              <Text style={s.qrRef}>{b.ref}</Text>
              {b.qr_payload && <Text style={[s.qrRef, { fontSize: 8, color: '#ADADAA' }]}>Tap to scan at gate</Text>}
              <QRCode value={b.qr_payload || b.ref} size={140} color='#111110' backgroundColor='#ffffff' />
              <Text style={s.qrSub}>{t('qrSub')}</Text>
            </View>
          </View>
        </View>
        <View style={s.summaryBox}>
          <Text style={s.summaryRoute}>{b.from.toUpperCase()} → {b.to.toUpperCase()}</Text>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>{t('seats')}</Text><Text style={s.summaryVal}>{b.seats.join(', ')}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Bus</Text><Text style={s.summaryVal}>{b.bus}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Ref</Text><Text style={s.summaryVal}>{b.ref}</Text></View>
          {b.extraBags > 0 && <View style={s.summaryRow}><Text style={s.summaryLabel}>{t('extraLuggage')}</Text><Text style={s.summaryVal}>{b.extraBags}</Text></View>}
          <View style={[s.summaryRow, s.summaryTotal]}>
            <Text style={s.summaryTotalLabel}>{t('grandTotal')}</Text>
            <Text style={s.summaryTotalVal}>FCFA {b.fare.toLocaleString()}</Text>
          </View>
        </View>
        <View style={s.confirmedBar}>
          <Text style={{ color: '#3DB34A', fontSize: 16 }}>✓</Text>
          <Text style={s.confirmedText}>{t('ticketsSecured')}</Text>
        </View>
        <View style={s.smsBar}>
          <Text style={s.smsIcon}>📱</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.smsTitle}>Ticket sent via SMS</Text>
            <Text style={s.smsSub}>Sent to {b.phone} · Garanti Express</Text>
          </View>
          <Text style={{ color: b.sms_sent ? '#3DB34A' : '#ADADAA', fontSize: 14 }}>{b.sms_sent ? '✓' : '–'}</Text>
        </View>

        <TouchableOpacity style={s.ghostBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'SearchTrip' }] })} activeOpacity={0.85}>
          <Text style={s.ghostBtnText}>{t('bookAnother')} →</Text>
        </TouchableOpacity>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell:             { flex: 1, backgroundColor: '#F7F7F5' },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: '#fff', padding: 14, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#EFEFED' },
  headerIcon:        { width: 34, height: 34, borderRadius: 17, backgroundColor: '#3DB34A', alignItems: 'center', justifyContent: 'center' },
  headerTitle:       { fontSize: 16, fontWeight: '600', color: '#3DB34A' },
  headerSub:         { fontSize: 10, color: '#ADADAA', marginTop: 1 },
  body:              { flex: 1, padding: 14 },
  ticketCard:        { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EFEFED', overflow: 'hidden' },
  ticketHeader:      { backgroundColor: '#3DB34A', padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ticketNum:         { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  ticketSeat:        { fontSize: 18, fontWeight: '700', color: '#fff' },
  ticketAvatar:      { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  ticketBody:        { padding: 14 },
  passengerName:     { fontSize: 16, fontWeight: '600', color: '#111110', marginBottom: 10 },
  ticketGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  tLabel:            { fontSize: 9, color: '#ADADAA', letterSpacing: 0.5 },
  tVal:              { fontSize: 12, fontWeight: '500', color: '#333331', marginTop: 2 },
  seatBadge:         { alignSelf: 'flex-start', backgroundColor: '#3DB34A', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 5, marginVertical: 6 },
  seatBadgeText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  costVal:           { fontSize: 17, fontWeight: '600', color: '#111110', marginBottom: 12 },
  qrBox:             { borderWidth: 1, borderColor: '#EFEFED', borderRadius: 12, padding: 12, alignItems: 'center', gap: 6 },
  qrRef:             { fontSize: 12, fontWeight: '600', color: '#333331' },
  qrSub:             { fontSize: 9, color: '#ADADAA', textAlign: 'center' },
  summaryBox:        { backgroundColor: '#F8FEF5', borderWidth: 1, borderColor: '#C0DD97', borderRadius: 14, padding: 14, gap: 4 },
  summaryRoute:      { fontSize: 11, fontWeight: '600', color: '#3DB34A', marginBottom: 6, letterSpacing: 0.5 },
  summaryRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  summaryLabel:      { fontSize: 12, color: '#737370' },
  summaryVal:        { fontSize: 12, fontWeight: '500', color: '#333331' },
  summaryTotal:      { borderTopWidth: 1, borderTopColor: '#C0DD97', borderBottomWidth: 0, paddingTop: 8, marginTop: 4 },
  summaryTotalLabel: { fontSize: 14, fontWeight: '600', color: '#111110' },
  summaryTotalVal:   { fontSize: 14, fontWeight: '600', color: '#3DB34A' },
  confirmedBar:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0FAF0', borderWidth: 1, borderColor: '#C0DD97', borderRadius: 10, padding: 10 },
  confirmedText:     { fontSize: 11, color: '#27500A', flex: 1, lineHeight: 16 },
  ghostBtn:          { borderWidth: 1.5, borderColor: '#3DB34A', borderRadius: 14, padding: 14, alignItems: 'center' },
  ghostBtnText:      { color: '#3DB34A', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
});
