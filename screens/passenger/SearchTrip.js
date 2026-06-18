import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useBookingStore } from '../../store/bookingStore';
import LangToggle from '../../components/LangToggle';

const TERMINALS = [
  { code: '65887779-2ea0-4615-813f-45772a8f5770', name: 'Douala Akwa',          city: 'Douala' },
  { code: 'edf50d69-0aa5-4baa-87be-b8b8eb60af2d', name: 'Douala Bonabéri',      city: 'Douala' },
  { code: '81bb4e6e-c758-47cd-a689-40e0f43a31f4', name: 'Yaoundé Nsam',         city: 'Yaoundé' },
  { code: 'ed2f3e2f-a2ff-4545-8950-f758ba9a4f95', name: 'Bamenda City Chemist', city: 'Bamenda' },
  { code: '436e3879-2c4c-4bdf-8801-134eb5621a51', name: 'Bafoussam',             city: 'Bafoussam' },
  { code: '49188d8e-ad15-4ee6-9100-2d85fb25988b', name: 'Buea',                  city: 'Buea' },
  { code: 'GE-LMB', name: 'Limbe', city: 'Limbe' },
];

function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function friendlyDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SearchTrip({ navigation }) {
  const { t } = useTranslation();
  const { search, setSearch } = useBookingStore();
  const [tripType, setTripType] = useState('one-way');
  const [showFromPicker, setShowFromPicker]         = useState(false);
  const [showToPicker, setShowToPicker]             = useState(false);
  const [showDatePicker, setShowDatePicker]         = useState(false);
  const [showReturnPicker, setShowReturnPicker]     = useState(false);
  const [selectedDate, setSelectedDate]             = useState(new Date());
  const [selectedReturnDate, setSelectedReturnDate] = useState(new Date());

  const canSearch = search.from && search.to && search.date && search.from !== search.to &&
    (tripType === 'one-way' || (tripType === 'round-trip' && search.returnDate));

  function onDateChange(event, date) {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setSearch({ date: formatDate(date) });
    }
  }

  function onReturnDateChange(event, date) {
    setShowReturnPicker(false);
    if (date) {
      setSelectedReturnDate(date);
      setSearch({ returnDate: formatDate(date) });
    }
  }

  function switchTripType(type) {
    setTripType(type);
    setSearch({ tripType: type });
    if (type === 'one-way') setSearch({ returnDate: null });
  }

  return (
    <SafeAreaView style={s.shell}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>{t('searchTrip')}</Text>

        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate("MyTickets")} style={{ padding: 4 }}><Text style={{ fontSize: 12, color: "#3DB34A", fontWeight: "600" }}>My Tickets</Text></TouchableOpacity>
          <LangToggle />
        </View>
      </View>

      <ScrollView style={s.body} contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
        {/* Toggle */}
        <View style={s.toggle}>
          <TouchableOpacity style={[s.toggleBtn, tripType === 'one-way' && s.toggleActive]} onPress={() => switchTripType('one-way')}>
            <Text style={[s.toggleText, tripType === 'one-way' && s.toggleTextActive]}>{t('oneWay')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.toggleBtn, tripType === 'round-trip' && s.toggleActive]} onPress={() => switchTripType('round-trip')}>
            <Text style={[s.toggleText, tripType === 'round-trip' && s.toggleTextActive]}>{t('roundTrip')}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          {/* From */}
          <Text style={s.label}>{t('departureTerminal')}</Text>
          <TouchableOpacity style={s.select} onPress={() => { setShowFromPicker(!showFromPicker); setShowToPicker(false); }}>
            <Text style={s.selectIcon}>📍</Text>
            <Text style={[s.selectText, !search.fromName && s.placeholder]}>{search.fromName || t('selectDeparture')}</Text>
            <Text style={s.chevron}>▾</Text>
          </TouchableOpacity>
          {showFromPicker && (
            <View style={s.picker}>
              {TERMINALS.map(tm => (
                <TouchableOpacity key={tm.code} style={s.pickerItem} onPress={() => { setSearch({ from: tm.code, fromName: tm.name }); setShowFromPicker(false); }}>
                  <Text style={s.pickerText}>{tm.name}</Text>
                  <Text style={s.pickerCity}>{tm.city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={s.divider} />

          {/* To */}
          <Text style={s.label}>{t('destinationTerminal')}</Text>
          <TouchableOpacity style={s.select} onPress={() => { setShowToPicker(!showToPicker); setShowFromPicker(false); }}>
            <Text style={s.selectIcon}>🏁</Text>
            <Text style={[s.selectText, !search.toName && s.placeholder]}>{search.toName || t('selectDestination')}</Text>
            <Text style={s.chevron}>▾</Text>
          </TouchableOpacity>
          {showToPicker && (
            <View style={s.picker}>
              {TERMINALS.filter(tm => tm.code !== search.from).map(tm => (
                <TouchableOpacity key={tm.code} style={s.pickerItem} onPress={() => { setSearch({ to: tm.code, toName: tm.name }); setShowToPicker(false); }}>
                  <Text style={s.pickerText}>{tm.name}</Text>
                  <Text style={s.pickerCity}>{tm.city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={s.divider} />

          {/* Departure date */}
          <Text style={s.label}>{t('departureDate')}</Text>
          <TouchableOpacity style={s.select} onPress={() => { setShowDatePicker(true); setShowReturnPicker(false); }}>
            <Text style={s.selectIcon}>📅</Text>
            <Text style={[s.selectText, !search.date && s.placeholder]}>
              {search.date ? friendlyDate(search.date) : 'Select departure date'}
            </Text>
            <Text style={s.chevron}>▾</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              minimumDate={new Date()}
              onChange={onDateChange}
              style={{ backgroundColor: '#fff' }}
            />
          )}

          {/* Return date — only for round trip */}
          {tripType === 'round-trip' && (
            <>
              <View style={s.divider} />
              <Text style={s.label}>Return Date</Text>
              <TouchableOpacity style={s.select} onPress={() => { setShowReturnPicker(true); setShowDatePicker(false); }}>
                <Text style={s.selectIcon}>🔄</Text>
                <Text style={[s.selectText, !search.returnDate && s.placeholder]}>
                  {search.returnDate ? friendlyDate(search.returnDate) : 'Select return date'}
                </Text>
                <Text style={s.chevron}>▾</Text>
              </TouchableOpacity>
              {showReturnPicker && (
                <DateTimePicker
                  value={selectedReturnDate}
                  mode="date"
                  display="spinner"
                  minimumDate={selectedDate}
                  onChange={onReturnDateChange}
                  style={{ backgroundColor: '#fff' }}
                />
              )}
            </>
          )}

          <View style={s.divider} />

          {/* Passengers */}
          <Text style={s.label}>{t('numberOfPassengers')}</Text>
          <View style={s.paxRow}>
            <View style={s.paxIcon}><Text style={{ fontSize: 18 }}>👥</Text></View>
            <Text style={s.paxLabel}>{search.passengers} {search.passengers > 1 ? t('passenger_other') : t('passenger_one')}</Text>
            <View style={s.paxCtrl}>
              <TouchableOpacity style={s.paxBtn} onPress={() => setSearch({ passengers: Math.max(1, search.passengers - 1) })}>
                <Text style={s.paxBtnText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.paxBtn} onPress={() => setSearch({ passengers: Math.min(6, search.passengers + 1) })}>
                <Text style={s.paxBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.btn, !canSearch && s.btnDisabled]}
          onPress={() => canSearch && navigation.navigate('SelectTrip')}
          activeOpacity={canSearch ? 0.85 : 1}
        >
          <Text style={s.btnText}>{t('viewTrips')} →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell:            { flex: 1, backgroundColor: '#F7F7F5' },
  header:           { backgroundColor: '#fff', padding: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: '#EFEFED', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title:            { fontSize: 16, fontWeight: '600', color: '#111110' },
  subtitle:         { fontSize: 11, color: '#ADADAA', marginTop: 2 },
  body:             { flex: 1, padding: 16 },
  toggle:           { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#EFEFED', overflow: 'hidden' },
  toggleBtn:        { flex: 1, padding: 11, alignItems: 'center' },
  toggleActive:     { backgroundColor: '#3DB34A', borderRadius: 10, margin: 2 },
  toggleText:       { fontSize: 12, fontWeight: '600', color: '#ADADAA', letterSpacing: 0.5 },
  toggleTextActive: { color: '#fff' },
  card:             { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EFEFED', padding: 14, gap: 8 },
  label:            { fontSize: 11, fontWeight: '600', color: '#737370', letterSpacing: 0.8, textTransform: 'uppercase' },
  select:           { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EFEFED', borderRadius: 12, padding: 11, gap: 8 },
  selectIcon:       { fontSize: 16 },
  selectText:       { flex: 1, fontSize: 14, color: '#111110' },
  placeholder:      { color: '#ADADAA' },
  chevron:          { fontSize: 12, color: '#ADADAA' },
  picker:           { backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFEFED', borderRadius: 10, marginTop: 4 },
  pickerItem:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F7F7F5' },
  pickerText:       { fontSize: 14, color: '#111110', fontWeight: '500' },
  pickerCity:       { fontSize: 12, color: '#ADADAA' },
  divider:          { height: 1, backgroundColor: '#F7F7F5' },
  paxRow:           { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EFEFED', borderRadius: 12, overflow: 'hidden' },
  paxIcon:          { backgroundColor: '#3DB34A', padding: 10, paddingHorizontal: 12 },
  paxLabel:         { flex: 1, fontSize: 14, fontWeight: '500', color: '#333331', paddingLeft: 12 },
  paxCtrl:          { flexDirection: 'row', gap: 6, paddingRight: 10 },
  paxBtn:           { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#EFEFED', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  paxBtnText:       { fontSize: 18, color: '#333331', lineHeight: 22 },
  footer:           { padding: 16, paddingBottom: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EFEFED' },
  btn:              { backgroundColor: '#3DB34A', borderRadius: 14, padding: 15, alignItems: 'center' },
  btnDisabled:      { backgroundColor: '#9fd4a5' },
  btnText:          { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
});
