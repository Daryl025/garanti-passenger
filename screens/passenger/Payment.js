import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, ActivityIndicator, Animated,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBookingStore } from '../../store/bookingStore';
import LangToggle from '../../components/LangToggle';

export default function Payment({ navigation }) {
  const { t } = useTranslation();
  const { confirmedBooking, paymentMethod, getTotalFare } = useBookingStore();
  const [stage, setStage]   = useState('enter');  // enter | waiting | confirmed
  const [phone, setPhone]   = useState('');
  const [error, setError]   = useState('');
  const [seconds, setSeconds] = useState(60);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const total = getTotalFare();

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [stage]);

  useEffect(() => {
    if (stage !== 'waiting') return;
    if (seconds <= 0) { setStage('confirmed'); return; }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [stage, seconds]);

  // Cash — skip straight to confirmed
  useEffect(() => {
    if (paymentMethod === 'cash') setStage('confirmed');
  }, []);

  function sendRequest() {
    if (phone.length < 9) { setError('Enter a valid 9-digit number'); return; }
    setError('');
    setStage('waiting');
    // In production: call MTN MoMo or Orange Money API here
    // For now simulate: auto-confirm after 5 seconds
    setTimeout(() => setStage('confirmed'), 5000);
  }

  function goToTicket() {
    navigation.replace('Confirmation');
  }

  const isMomo   = paymentMethod === 'mtn_momo';
  const isOrange = paymentMethod === 'orange_money';
  const isCash   = paymentMethod === 'cash';

  return (
    <SafeAreaView style={s.shell}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Payment</Text>
        <LangToggle />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View style={[s.body, { opacity: fadeAnim }]}>

        {/* ── CASH ─────────────────────────────────── */}
        {isCash && stage === 'confirmed' && (
          <View style={s.centerCard}>
            <View style={[s.iconCircle, { backgroundColor: '#EAF3DE' }]}>
              <Text style={s.iconEmoji}>💵</Text>
            </View>
            <Text style={s.stageTitle}>Pay at the counter</Text>
            <Text style={s.stageSub}>Show this screen to the agent and pay</Text>
            <View style={s.amountBox}>
              <Text style={s.amountLabel}>AMOUNT TO PAY</Text>
              <Text style={s.amountVal}>FCFA {total.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={s.btn} onPress={goToTicket} activeOpacity={0.85}>
              <Text style={s.btnText}>AGENT CONFIRMED PAYMENT →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MTN MOMO — Enter phone ────────────────── */}
        {isMomo && stage === 'enter' && (
          <View style={s.centerCard}>
            <View style={[s.iconCircle, { backgroundColor: '#FFF3CD' }]}>
              <Text style={s.iconEmoji}>📱</Text>
            </View>
            <Text style={s.stageTitle}>MTN Mobile Money</Text>
            <Text style={s.stageSub}>Enter your MTN number below. You will receive a payment prompt on your phone — approve it with your MoMo PIN and your ticket is issued instantly.</Text>
            <View style={s.amountBox}>
              <Text style={s.amountLabel}>AMOUNT</Text>
              <Text style={s.amountVal}>FCFA {total.toLocaleString()}</Text>
            </View>
            <View style={s.inputWrap}>
              <Text style={s.inputPrefix}>+237</Text>
              <TextInput
                style={s.phoneInput}
                placeholder="677 000 000"
                placeholderTextColor="#ADADAA"
                keyboardType="phone-pad"
                maxLength={9}
                value={phone}
                onChangeText={v => { setPhone(v); setError(''); }}
                returnKeyType="done"
                onSubmitEditing={sendRequest}
              />
            </View>
            {error ? <Text style={s.errorText}>{error}</Text> : null}
            <TouchableOpacity style={[s.btn, { backgroundColor: '#FFC107' }]} onPress={sendRequest} activeOpacity={0.85}>
              <Text style={[s.btnText, { color: '#111' }]}>SEND PAYMENT REQUEST →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MTN MOMO — Waiting ────────────────────── */}
        {isMomo && stage === 'waiting' && (
          <View style={s.centerCard}>
            <ActivityIndicator size="large" color="#FFC107" style={{ marginBottom: 20 }} />
            <Text style={s.stageTitle}>Waiting for confirmation</Text>
            <Text style={s.stageSub}>A payment request has been sent to</Text>
            <Text style={s.phoneDisplay}>+237 {phone}</Text>
            <View style={s.instructBox}>
              <Text style={s.instructStep}>1. Check your phone for an MTN MoMo prompt</Text>
              <Text style={s.instructStep}>2. Enter your MoMo PIN to confirm</Text>
              <Text style={s.instructStep}>3. Your ticket will be issued automatically</Text>
            </View>
            <View style={s.timerBox}>
              <Text style={s.timerText}>Request expires in {seconds}s</Text>
            </View>
            <TouchableOpacity style={s.ghostBtn} onPress={() => setStage('enter')}>
              <Text style={s.ghostBtnText}>Use a different number</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── ORANGE MONEY — Enter phone ────────────── */}
        {isOrange && stage === 'enter' && (
          <View style={s.centerCard}>
            <View style={[s.iconCircle, { backgroundColor: '#FFE5CC' }]}>
              <Text style={s.iconEmoji}>🟠</Text>
            </View>
            <Text style={s.stageTitle}>Orange Money</Text>
            <Text style={s.stageSub}>Enter your Orange number below. You will receive payment instructions — follow them to complete your payment and get your ticket instantly.</Text>
            <View style={s.amountBox}>
              <Text style={s.amountLabel}>AMOUNT</Text>
              <Text style={s.amountVal}>FCFA {total.toLocaleString()}</Text>
            </View>
            <View style={s.inputWrap}>
              <Text style={s.inputPrefix}>+237</Text>
              <TextInput
                style={s.phoneInput}
                placeholder="695 000 000"
                placeholderTextColor="#ADADAA"
                keyboardType="phone-pad"
                maxLength={9}
                value={phone}
                onChangeText={v => { setPhone(v); setError(''); }}
                returnKeyType="done"
                onSubmitEditing={sendRequest}
              />
            </View>
            {error ? <Text style={s.errorText}>{error}</Text> : null}
            <TouchableOpacity style={[s.btn, { backgroundColor: '#FF6600' }]} onPress={sendRequest} activeOpacity={0.85}>
              <Text style={s.btnText}>SEND PAYMENT REQUEST →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── ORANGE MONEY — Waiting ────────────────── */}
        {isOrange && stage === 'waiting' && (
          <View style={s.centerCard}>
            <ActivityIndicator size="large" color="#FF6600" style={{ marginBottom: 20 }} />
            <Text style={s.stageTitle}>Confirm on your phone</Text>
            <Text style={s.stageSub}>Dial this code to confirm your payment</Text>
            <View style={[s.amountBox, { backgroundColor: '#FFE5CC', borderColor: '#FF6600' }]}>
              <Text style={[s.amountVal, { color: '#FF6600', fontSize: 28 }]}>#150#</Text>
              <Text style={[s.amountLabel, { marginTop: 4 }]}>Dial on your Orange phone</Text>
            </View>
            <View style={s.instructBox}>
              <Text style={s.instructStep}>1. Dial #150# on your Orange phone</Text>
              <Text style={s.instructStep}>2. Select "Payer un marchand"</Text>
              <Text style={s.instructStep}>3. Enter the merchant code</Text>
              <Text style={s.instructStep}>4. Confirm with your PIN</Text>
            </View>
            <TouchableOpacity style={[s.btn, { backgroundColor: '#FF6600' }]} onPress={goToTicket} activeOpacity={0.85}>
              <Text style={s.btnText}>I HAVE CONFIRMED PAYMENT →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ghostBtn} onPress={() => setStage('enter')}>
              <Text style={s.ghostBtnText}>Use a different number</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── CONFIRMED ─────────────────────────────── */}
        {stage === 'confirmed' && !isCash && (
          <View style={s.centerCard}>
            <View style={[s.iconCircle, { backgroundColor: '#EAF3DE' }]}>
              <Text style={s.iconEmoji}>✅</Text>
            </View>
            <Text style={s.stageTitle}>Payment confirmed!</Text>
            <Text style={s.stageSub}>Your payment of FCFA {total.toLocaleString()} was received successfully</Text>
            <TouchableOpacity style={s.btn} onPress={goToTicket} activeOpacity={0.85}>
              <Text style={s.btnText}>VIEW MY TICKET →</Text>
            </TouchableOpacity>
          </View>
        )}

      </Animated.View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell:        { flex: 1, backgroundColor: '#F7F7F5' },
  header:       { backgroundColor: '#fff', padding: 14, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#EFEFED', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:     { fontSize: 14, color: '#3DB34A', fontWeight: '500' },
  title:        { fontSize: 17, fontWeight: '600', color: '#111110' },
  body:         { flex: 1, padding: 20, justifyContent: 'center' },
  centerCard:   { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#EFEFED' },
  iconCircle:   { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  iconEmoji:    { fontSize: 32 },
  stageTitle:   { fontSize: 20, fontWeight: '700', color: '#111110', textAlign: 'center' },
  stageSub:     { fontSize: 14, color: '#737370', textAlign: 'center', lineHeight: 20 },
  amountBox:    { backgroundColor: '#EAF3DE', borderRadius: 12, padding: 16, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#C0DD97' },
  amountLabel:  { fontSize: 10, color: '#737370', letterSpacing: 0.8, fontWeight: '600' },
  amountVal:    { fontSize: 24, fontWeight: '700', color: '#3DB34A', marginTop: 4 },
  inputWrap:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#EFEFED', borderRadius: 12, overflow: 'hidden', width: '100%' },
  inputPrefix:  { backgroundColor: '#F7F7F5', padding: 13, fontSize: 14, fontWeight: '600', color: '#737370', borderRightWidth: 1, borderRightColor: '#EFEFED' },
  phoneInput:   { flex: 1, padding: 13, fontSize: 16, color: '#111110' },
  errorText:    { fontSize: 12, color: '#E24B4A', alignSelf: 'flex-start' },
  phoneDisplay: { fontSize: 20, fontWeight: '700', color: '#111110' },
  instructBox:  { backgroundColor: '#F7F7F5', borderRadius: 12, padding: 14, width: '100%', gap: 8 },
  instructStep: { fontSize: 13, color: '#737370', lineHeight: 20 },
  timerBox:     { backgroundColor: '#FAEEDA', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  timerText:    { fontSize: 12, color: '#633806', fontWeight: '500' },
  btn:          { backgroundColor: '#3DB34A', borderRadius: 14, padding: 15, alignItems: 'center', width: '100%' },
  btnText:      { color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  ghostBtn:     { paddingVertical: 8 },
  ghostBtnText: { fontSize: 13, color: '#ADADAA', textDecorationLine: 'underline' },
});
