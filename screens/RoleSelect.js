import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

export default function RoleSelect({ navigation }) {
  const { t } = useTranslation();

  function switchLang() {
    const next = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(next);
    AsyncStorage.setItem('tms_language', next);
  }

  const roles = [
    { icon: '🎫', title: t('passenger'), sub: t('passengerSub'), screen: 'SearchTrip', color: '#3DB34A', bg: '#EAF3DE' },
  
  
  ];

  return (
    <SafeAreaView style={s.shell}>
      <ScrollView contentContainerStyle={s.inner} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.langToggle} onPress={switchLang}>
          <Text style={s.langToggleText}>{i18n.language === 'en' ? 'EN' : 'FR'} v</Text>
        </TouchableOpacity>
        <View style={s.logo}>
          <View style={s.logoMark}><Text style={s.logoMarkText}>GE</Text></View>
          <View>
            <Text style={s.logoName}>{t('appName')}</Text>
            <Text style={s.logoTag}>{t('tagline')}</Text>
          </View>
        </View>
        <Text style={s.title}>{t('whoAreYou')}</Text>
        <Text style={s.sub}>{t('selectRole')}</Text>
        <View style={s.cards}>
          {roles.map((r) => (
            <TouchableOpacity key={r.title} style={s.card} onPress={() => navigation.navigate(r.screen)} activeOpacity={0.85}>
              <View style={[s.iconWrap, { backgroundColor: r.bg }]}>
                <Text style={s.icon}>{r.icon}</Text>
              </View>
              <View style={s.cardText}>
                <Text style={s.cardTitle}>{r.title}</Text>
                <Text style={s.cardSub}>{r.sub}</Text>
              </View>
              <Text style={[s.cardArrow, { color: r.color }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.footer}>Amour Mezam · Garanti Express · TMS v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell:          { flex: 1, backgroundColor: '#F7F7F5' },
  inner:          { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 32 },
  langToggle:     { alignSelf: 'flex-end', borderWidth: 1, borderColor: '#DDDDD9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 24 },
  langToggleText: { fontSize: 12, fontWeight: '600', color: '#333331' },
  logo:           { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 36 },
  logoMark:       { width: 48, height: 48, borderRadius: 14, backgroundColor: '#3DB34A', alignItems: 'center', justifyContent: 'center' },
  logoMarkText:   { color: '#fff', fontSize: 18, fontWeight: '700' },
  logoName:       { fontSize: 18, fontWeight: '700', color: '#111110' },
  logoTag:        { fontSize: 11, color: '#ADADAA', marginTop: 2 },
  title:          { fontSize: 22, fontWeight: '600', color: '#111110', textAlign: 'center', marginBottom: 6 },
  sub:            { fontSize: 14, color: '#ADADAA', textAlign: 'center', marginBottom: 28 },
  cards:          { width: '100%', gap: 12, marginBottom: 32 },
  card:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#EFEFED', borderRadius: 16, padding: 16, gap: 14 },
  iconWrap:       { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon:           { fontSize: 22 },
  cardText:       { flex: 1 },
  cardTitle:      { fontSize: 15, fontWeight: '600', color: '#111110' },
  cardSub:        { fontSize: 12, color: '#ADADAA', marginTop: 2 },
  cardArrow:      { fontSize: 20 },
  footer:         { fontSize: 11, color: '#DDDDD9', textAlign: 'center' },
});
