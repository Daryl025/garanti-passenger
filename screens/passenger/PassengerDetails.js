import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, TextInput, Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../store/bookingStore';
import LangToggle from '../../components/LangToggle';
import api from '../../api';

export default function PassengerDetails({ navigation }) {
  const { t } = useTranslation();
  const { selectedTrip, selectedSeats, search, extraBags, setExtraBags, getTotalFare, setConfirmedBooking, setPaymentMethod } = useBookingStore();
  const [name, setName]     = useState('');
  const [phone, setPhone]   = useState('');
  const [errors, setErrors] = useState({});
  const [payMethod, setPayMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const total = getTotalFare();
  const [standardBags, setStandardBags] = useState(1);

  function validate() {
    const e = {};
    if (!name.trim())  e.name  = t('nameRequired');
    if (!phone.trim()) e.phone = t('phoneRequired');
    return e;
  }

  async function proceed() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!selectedTrip?.id) {
      Alert.alert('Error', 'No trip selected. Please go back and select a trip.');
      return;
    }
    setPaymentMethod(payMethod);
    setLoading(true);
    try {
      const res = await api.post('/api/tickets/book', {
        trip_id: selectedTrip.id,
        passenger_name: name.trim(),
        passenger_phone: phone.trim(),
        seat_numbers: selectedSeats,
        payment_method: payMethod,
        ticket_type: 'online',
        extra_bags: extraBags,
        fare_paid: total,
      });
      const ticket = res.data.tickets[0];
      setConfirmedBooking({
        ref:        ticket.ref,
        passenger:  name.trim(),
        phone:      phone.trim(),
        from:       search.fromName,
        to:         search.toName,
        date:       selectedTrip.trip_date?.split('T')[0] || search.date,
        time:       selectedTrip.depart_time?.slice(0,5) || '06:00',
        seats:      selectedSeats,
        bus:        selectedTrip.bus_code || 'GE-101',
        fare:       total,
        extraBags,
        payment:    payMethod,
        qr_payload: ticket.qr_payload,
        qr_image:   ticket.qr_image,
        ticket_id:  ticket.id,
      });
      navigation.navigate('Payment');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Booking failed';
      Alert.alert('Booking Failed', JSON.stringify(err.response?.data) || msg);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  const payOptions = [
    { key: 'cash',         label: 'Cash au guichet',  icon: '💵' },
    { key: 'mtn_momo',     label: 'MTN Mobile Money', icon: '📱' },
    { key: 'orange_money', label: 'Orange Money',      icon: '🟠' },
  ];

  return (
    <SafeAreaView style={s.shell}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t('passengerDetails')}</Text>
        <LangToggle />
      </View>
      <ScrollView style={s.body} contentContainerStyle={{ gap: 12 }} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.cardTitle}>👤 PASSENGER INFO</Text>
          <Text style={s.label}>{t('fullName')}</Text>
          <View style={[s.input, errors.name && s.inputError]}>
            <Text style={s.inputIcon}>👤</Text>
            <TextInput style={s.inputField} placeholder={t('namePlaceholder')} placeholderTextColor="#ADADAA"
              value={name} onChangeText={v => { setName(v); setErrors(e => ({ ...e, name: null })); }} />
          </View>
          {errors.name && <Text style={s.errorText}>{errors.name}</Text>}
          <Text style={[s.label, { marginTop: 10 }]}>{t('phoneNumber')}</Text>
          <View style={[s.input, errors.phone && s.inputError]}>
            <Text style={s.inputIcon}>📞</Text>
            <TextInput style={s.inputField} placeholder={t('phonePlaceholder')} placeholderTextColor="#ADADAA"
              value={phone} onChangeText={v => { setPhone(v); setErrors(e => ({ ...e, phone: null })); }}
              keyboardType="phone-pad" maxLength={12} />
          </View>
          {errors.phone && <Text style={s.errorText}>{errors.phone}</Text>}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>🪑 SELECTED SEATS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {selectedSeats.map(seat => (
              <View key={seat} style={s.seatBadge}><Text style={s.seatBadgeText}>{seat}</Text></View>
            ))}
          </View>
        </View>

        <View style={[s.card, { borderColor: '#B5D4F4', borderWidth: 1.5 }]}>
          <Text style={s.cardTitle}>🧳 {t('extrasLuggage')}</Text>
          <View style={s.extraItem}>
            <View style={s.extraLeft}>
              <Text style={{ fontSize: 18 }}>💼</Text>
              <View>
                <Text style={s.extraName}>{t('standardBag')} <Text style={s.extraNote}>({t('included')})</Text></Text>
                <Text style={[s.extraPrice, { color: '#3DB34A' }]}>FREE</Text>
              </View>
            </View>
            <View style={s.ctrlRow}>
              <TouchableOpacity style={s.ctrlBtn} onPress={() => setStandardBags(Math.max(1, standardBags - 1))}><Text style={s.ctrlBtnText}>−</Text></TouchableOpacity>
              <Text style={s.ctrlVal}>{standardBags}</Text>
              <TouchableOpacity style={s.ctrlBtn} onPress={() => setStandardBags(standardBags + 1)}><Text style={s.ctrlBtnText}>+</Text></TouchableOpacity>
            </View>
          </View>
          <View style={[s.extraItem, { borderColor: '#EF9F27', backgroundColor: '#FAEEDA' }]}>
            <View style={s.extraLeft}>
              <Text style={{ fontSize: 18 }}>📦</Text>
              <View>
                <Text style={s.extraName}>{t('heavyCargo')} <Text style={s.extraNote}>(+1,500 FCFA)</Text></Text>
                <Text style={[s.extraPrice, { color: extraBags > 0 ? '#3DB34A' : '#EF9F27' }]}>{extraBags > 0 ? `${extraBags} selected` : t('notSelected')}</Text>
              </View>
            </View>
            <View style={s.ctrlRow}>
              <TouchableOpacity style={s.ctrlBtn} onPress={() => setExtraBags(Math.max(0, extraBags - 1))}><Text style={s.ctrlBtnText}>−</Text></TouchableOpacity>
              <Text style={s.ctrlVal}>{extraBags}</Text>
              <TouchableOpacity style={s.ctrlBtn} onPress={() => setExtraBags(extraBags + 1)}><Text style={s.ctrlBtnText}>+</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>💳 PAYMENT METHOD</Text>
          {payOptions.map(opt => (
            <TouchableOpacity key={opt.key} style={[s.payOption, payMethod === opt.key && s.payOptionActive]} onPress={() => setPayMethod(opt.key)} activeOpacity={0.85}>
              <Text style={{ fontSize: 20 }}>{opt.icon}</Text>
              <Text style={s.payLabel}>{opt.label}</Text>
              {payMethod === opt.key && <Text style={{ color: '#3DB34A', fontSize: 16 }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>{t('totalFare')}</Text>
          <Text style={s.totalVal}>FCFA {total.toLocaleString()}</Text>
        </View>
        <View style={{ height: 10 }} />
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={proceed} activeOpacity={0.85} disabled={loading}>
          <Text style={s.btnText}>{loading ? 'Booking...' : t('proceedToPay') + ' →'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell:           { flex: 1, backgroundColor: '#F7F7F5' },
  header:          { backgroundColor: '#fff', padding: 14, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#EFEFED', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:        { fontSize: 14, color: '#3DB34A', fontWeight: '500' },
  title:           { fontSize: 17, fontWeight: '600', color: '#111110' },
  body:            { flex: 1, padding: 14 },
  card:            { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EFEFED', padding: 14, gap: 8 },
  cardTitle:       { fontSize: 11, fontWeight: '600', color: '#737370', letterSpacing: 0.8, marginBottom: 4 },
  label:           { fontSize: 11, fontWeight: '600', color: '#737370', letterSpacing: 0.8, textTransform: 'uppercase' },
  input:           { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EFEFED', borderRadius: 12, padding: 11, gap: 8 },
  inputError:      { borderColor: '#E24B4A' },
  inputIcon:       { fontSize: 16 },
  inputField:      { flex: 1, fontSize: 14, color: '#111110' },
  errorText:       { fontSize: 11, color: '#E24B4A', marginTop: 2 },
  seatBadge:       { backgroundColor: '#3DB34A', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  seatBadgeText:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  extraItem:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#EFEFED', borderRadius: 10, padding: 10, marginBottom: 6 },
  extraLeft:       { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  extraName:       { fontSize: 12, fontWeight: '500', color: '#333331' },
  extraNote:       { fontSize: 10, color: '#ADADAA', fontWeight: '400' },
  extraPrice:      { fontSize: 11, fontWeight: '500', marginTop: 2 },
  ctrlRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctrlBtn:         { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#DDDDD9', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  ctrlBtnText:     { fontSize: 16, color: '#333331', lineHeight: 20 },
  ctrlVal:         { fontSize: 13, fontWeight: '600', color: '#111110', minWidth: 14, textAlign: 'center' },
  payOption:       { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#EFEFED', borderRadius: 10, padding: 10, marginBottom: 6 },
  payOptionActive: { borderColor: '#3DB34A', backgroundColor: '#F8FEF5' },
  payLabel:        { flex: 1, fontSize: 13, fontWeight: '500', color: '#333331' },
  totalRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EAF3DE', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#C0DD97' },
  totalLabel:      { fontSize: 12, color: '#27500A' },
  totalVal:        { fontSize: 16, fontWeight: '600', color: '#3DB34A' },
  footer:          { padding: 14, paddingBottom: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EFEFED' },
  btn:             { backgroundColor: '#3DB34A', borderRadius: 14, padding: 15, alignItems: 'center' },
  btnText:         { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
});
