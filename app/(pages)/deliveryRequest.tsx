import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';

const GOOGLE_MAPS_APIKEY = 'AIzaSyDlDH30chD_FFQ3ewtahu3-kSot1S3vOX0';

export default function DeliveryRequest() {
  const [pickupLoc, setPickupLoc]     = useState(null);
  const [dropoffLoc, setDropoffLoc]   = useState(null);
  const [category, setCategory]       = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice]             = useState('');
  const [eta, setEta]                 = useState('');
  const [mapMode, setMapMode]         = useState(null); // 'pickup' | 'dropoff'
  const mapRef = useRef();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!pickupLoc || !dropoffLoc || !category || !price || !eta) {
      return Alert.alert('Error', 'Please fill all required fields.');
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await api.post(
        '/api/delivery',
        {
          pickupLoc,
          dropoffLoc,
          category,
          item_description: description,
          price,
          estimated_time: eta,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Delivery request created!');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create delivery.');
    }
  };

  const onMapPress = async e => {
    if (!mapMode) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const json = await resp.json();
      const address = json.results?.[0]?.formatted_address || 'Unnamed location';
      if (mapMode === 'pickup')   setPickupLoc({ address, latitude, longitude });
      else if (mapMode === 'dropoff') setDropoffLoc({ address, latitude, longitude });
    } catch {
      const fallback = 'Pinned location';
      if (mapMode === 'pickup')   setPickupLoc({ address: fallback, latitude, longitude });
      else if (mapMode === 'dropoff') setDropoffLoc({ address: fallback, latitude, longitude });
    } finally {
      setMapMode(null);
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#2563eb" />
        </TouchableOpacity>
        <Text className='font-pbold' style={styles.headerTitle}>New Delivery Request</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Pickup Autocomplete */}
          <View style={[styles.autocompleteContainer, { zIndex: 3 }]}>
            <GooglePlacesAutocomplete
              placeholder="Pickup location"
              fetchDetails
              onPress={(data, details) => {
                const { lat, lng } = details.geometry.location;
                setPickupLoc({ address: data.description, latitude: lat, longitude: lng });
                mapRef.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 });
              }}
              query={{ key: GOOGLE_MAPS_APIKEY, language: 'en' }}
              styles={autocompleteStyles}
              listViewProps={{ nestedScrollEnabled: true }}
            />
          </View>

          {/* Dropoff Autocomplete */}
          <View style={[styles.autocompleteContainer, { zIndex: 2 }]}>
            <GooglePlacesAutocomplete
              placeholder="Dropoff location"
              fetchDetails
              onPress={(data, details) => {
                const { lat, lng } = details.geometry.location;
                setDropoffLoc({ address: data.description, latitude: lat, longitude: lng });
                mapRef.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 });
              }}
              query={{ key: GOOGLE_MAPS_APIKEY, language: 'en' }}
              styles={autocompleteStyles}
              listViewProps={{ nestedScrollEnabled: true }}
            />
          </View>

          {/* Map Mode Buttons */}
          <View style={styles.mapControls}>
            <TouchableOpacity
              style={[styles.modeBtn, mapMode==='pickup' && styles.modeBtnActive]}
              onPress={() => setMapMode('pickup')}
            >
              <Text style={[styles.modeText, mapMode==='pickup' && styles.modeTextActive]}>
                ⬤ Pickup
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mapMode==='dropoff' && styles.modeBtnActive]}
              onPress={() => setMapMode('dropoff')}
            >
              <Text style={[styles.modeText, mapMode==='dropoff' && styles.modeTextActive]}>
                ⬤ Dropoff
              </Text>
            </TouchableOpacity>
          </View>

          {/* Map */}
          <View style={styles.mapWrapper}>
            <MapView
              ref={mapRef}
              style={styles.map}
              onPress={onMapPress}
              initialRegion={{
                latitude: 33.8886,
                longitude: 35.4955,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {pickupLoc && (
                <Marker
                  coordinate={pickupLoc}
                  pinColor="blue"
                  title="Pickup"
                  description={pickupLoc.address}
                />
              )}
              {dropoffLoc && (
                <Marker
                  coordinate={dropoffLoc}
                  pinColor="green"
                  title="Dropoff"
                  description={dropoffLoc.address}
                />
              )}
            </MapView>
          </View>

          {/* Category Picker */}
          <View className='border border-gray-300 rounded-lg' style={{ marginBottom: 16, width: '100%' }}>
            <RNPickerSelect
              onValueChange={setCategory}
              items={[
                { label: 'Food', value: 'food' },
                { label: 'Groceries', value: 'groceries' },
                { label: 'Packages', value: 'packages' },
                { label: 'Furniture', value: 'furniture' },
              ]}
              placeholder={{ label: 'Select a category…', value: null }}
              style={pickerStyles.inputAndroid}
              value={category}
            />
          </View>

          {/* Other Inputs */}
          <TextInput
            placeholder="Item description (optional)"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />
          <TextInput
            placeholder="Price"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            style={styles.input}
          />
          <TextInput
            placeholder="Estimated time (e.g. 30 mins)"
            value={eta}
            onChangeText={setEta}
            style={[styles.input, styles.lastInput]}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Publish Request</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1 },
  header:    { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { marginLeft: 12, fontSize: 18, color: 'black' },
  container: { padding: 16, alignItems: 'center' },
  autocompleteContainer: { width: '100%', marginBottom: 12 },
  mapControls: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  modeBtn:   { flex: 1, padding: 10, backgroundColor: '#eee', borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#2563eb' },
  modeText:  { color: '#333', fontWeight: '600' },
  modeTextActive: { color: '#fff' },
  mapWrapper:{ width: '100%', height: 200, borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  map:       { flex: 1 },
  input:     { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16 },
  lastInput: { marginBottom: 24 },
  button:    { width: '100%', backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText:{ color: '#fff', fontWeight: '600' },
});

const pickerStyles = {
  inputIOS:       { fontSize: 16, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, color: '#333', marginBottom: 16 },
  inputAndroid:   { fontSize: 16, padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, color: '#333', marginBottom: 16 },
  placeholder:    { color: '#999' },
};

const autocompleteStyles = {
  textInputContainer: { backgroundColor: '#eee', borderRadius: 8 },
  textInput:          { height: 44, color: '#333', fontSize: 16, borderRadius: 8 },
  listView:           { backgroundColor: '#fff', borderRadius: 8 },
};
