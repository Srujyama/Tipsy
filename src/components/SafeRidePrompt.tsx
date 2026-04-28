import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Linking, Alert} from 'react-native';

interface SafeRidePromptProps {
  drinkCount: number;
}

export default function SafeRidePrompt({drinkCount}: SafeRidePromptProps) {
  if (drinkCount < 2) return null;

  const openUber = () => {
    Linking.openURL('uber://').catch(() => {
      Linking.openURL('https://m.uber.com/').catch(() =>
        Alert.alert('', 'Could not open Uber'),
      );
    });
  };

  const openLyft = () => {
    Linking.openURL('lyft://').catch(() => {
      Linking.openURL('https://www.lyft.com/ride').catch(() =>
        Alert.alert('', 'Could not open Lyft'),
      );
    });
  };

  return (
    <View style={s.container}>
      <Text style={s.icon}>🚕</Text>
      <View style={{flex: 1}}>
        <Text style={s.title}>Get a safe ride home</Text>
        <Text style={s.subtitle}>If you've been drinking, don't drive — call a ride.</Text>
      </View>
      <View style={s.buttons}>
        <TouchableOpacity style={s.rideBtn} onPress={openUber}>
          <Text style={s.rideBtnText}>Uber</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.rideBtn} onPress={openLyft}>
          <Text style={s.rideBtnText}>Lyft</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111116',
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#c9a96e40',
    padding: 16,
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    color: '#c9a96e',
    fontSize: 14,
    fontWeight: '400',
  },
  subtitle: {
    color: '#555',
    fontSize: 11,
    marginTop: 2,
  },
  buttons: {
    flexDirection: 'column',
    gap: 6,
  },
  rideBtn: {
    backgroundColor: '#1a1a22',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#1e1e25',
  },
  rideBtnText: {
    color: '#f5f0eb',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
