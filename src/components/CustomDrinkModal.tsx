import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface CustomDrinkModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (drink: {name: string; oz: number; abv: number; calories: number}) => void;
}

export default function CustomDrinkModal({visible, onClose, onSave}: CustomDrinkModalProps) {
  const [name, setName] = useState('');
  const [oz, setOz] = useState('');
  const [abv, setAbv] = useState('');
  const [calories, setCalories] = useState('');

  const handleSave = () => {
    if (!name.trim() || !oz || !abv) {
      Alert.alert('', 'Please fill in name, size, and ABV');
      return;
    }
    const ozNum = parseFloat(oz);
    const abvNum = parseFloat(abv) / 100; // Convert % to decimal
    const calNum = parseInt(calories, 10) || Math.round(ozNum * 29.5735 * abvNum * 0.789 * 7);

    onSave({name: name.trim(), oz: ozNum, abv: abvNum, calories: calNum});
    setName('');
    setOz('');
    setAbv('');
    setCalories('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.title}>CUSTOM DRINK</Text>
          <Text style={s.subtitle}>Create a drink not in our list</Text>

          <Text style={s.label}>DRINK NAME</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Jungle Juice"
            placeholderTextColor="#333"
          />

          <View style={s.row}>
            <View style={{flex: 1}}>
              <Text style={s.label}>SIZE (OZ)</Text>
              <TextInput
                style={s.input}
                value={oz}
                onChangeText={setOz}
                placeholder="12"
                placeholderTextColor="#333"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{width: 16}} />
            <View style={{flex: 1}}>
              <Text style={s.label}>ABV %</Text>
              <TextInput
                style={s.input}
                value={abv}
                onChangeText={setAbv}
                placeholder="5"
                placeholderTextColor="#333"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Text style={s.label}>CALORIES (OPTIONAL)</Text>
          <TextInput
            style={s.input}
            value={calories}
            onChangeText={setCalories}
            placeholder="Auto-calculated if empty"
            placeholderTextColor="#333"
            keyboardType="numeric"
          />

          {oz && abv && (
            <Text style={s.preview}>
              ≈ {((parseFloat(oz) || 0) * (parseFloat(abv) || 0) / 100 / 0.6).toFixed(1)} standard drinks
              {!calories && ` · ~${Math.round((parseFloat(oz) || 0) * 29.5735 * ((parseFloat(abv) || 0) / 100) * 0.789 * 7)} cal estimated`}
            </Text>
          )}

          <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
            <Text style={s.saveBtnText}>Log Drink</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#111116',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#f5f0eb',
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#555',
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    color: '#555',
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#1e1e25',
    paddingVertical: 12,
    fontSize: 16,
    color: '#f5f0eb',
    fontWeight: '300',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  preview: {
    color: '#c9a96e',
    fontSize: 12,
    fontWeight: '300',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  saveBtn: {
    backgroundColor: '#c9a96e',
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: {
    color: '#0a0a0f',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#555',
    fontSize: 13,
    letterSpacing: 1,
  },
});
