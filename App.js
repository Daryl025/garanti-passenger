import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import OfflineBanner from './components/OfflineBanner';
import LanguagePicker from './screens/LanguagePicker';
import RoleSelect from './screens/RoleSelect';
import SearchTrip from './screens/passenger/SearchTrip';
import SelectTrip from './screens/passenger/SelectTrip';
import SeatMap from './screens/passenger/SeatMap';
import PassengerDetails from './screens/passenger/PassengerDetails';
import MyTickets    from './screens/passenger/MyTickets';
import Confirmation from './screens/passenger/Confirmation';
import Payment from './screens/passenger/Payment';

const Stack = createNativeStackNavigator();

export default function App() {
  const [hasLanguage, setHasLanguage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('tms_language').then(lang => {
      setHasLanguage(lang !== null && lang !== undefined && lang !== '');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111110' }}>
        <ActivityIndicator color="#3DB34A" size="large" />
      </View>
    );
  }

  return (
    <>
      <OfflineBanner />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!hasLanguage ? (
            <Stack.Screen name="Language" component={LanguagePicker} />
          ) : (
            <>
              <Stack.Screen name="RoleSelect" component={RoleSelect} />
              <Stack.Screen name="SearchTrip" component={SearchTrip} />
              <Stack.Screen name="SelectTrip" component={SelectTrip} />
              <Stack.Screen name="SeatMap" component={SeatMap} />
              <Stack.Screen name="PassengerDetails" component={PassengerDetails} />
              <Stack.Screen name="Payment" component={Payment} />
              <Stack.Screen name="Confirmation" component={Confirmation} />
              <Stack.Screen name="MyTickets" component={MyTickets} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
