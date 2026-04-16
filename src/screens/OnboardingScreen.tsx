import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {updateUserProfile, getCurrentUser} from '../services/firebase';

export default function OnboardingScreen({onComplete}: {onComplete: () => void}) {
  const [step, setStep] = useState(0);
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | null>(null);
  const [saving, setSaving] = useState(false);

  const user = getCurrentUser();

  const handleComplete = async () => {
    if (!user) return;
    if (!weight || !age || !gender) {
      Alert.alert('Missing info', 'Please complete all fields');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        weight: parseInt(weight, 10),
        age: parseInt(age, 10),
        gender,
      });
      onComplete();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const genderOptions: {value: 'Male' | 'Female' | 'Other'; label: string}[] = [
    {value: 'Male', label: 'Male'},
    {value: 'Female', label: 'Female'},
    {value: 'Other', label: 'Other'},
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        {/* Progress dots */}
        <View style={styles.progressRow}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[styles.progressDot, i <= step && styles.progressDotActive]}
            />
          ))}
        </View>

        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>STEP 1 OF 3</Text>
            <Text style={styles.stepTitle}>How old are you?</Text>
            <Text style={styles.stepSubtitle}>
              Alcohol metabolism changes with age.{'\n'}
              Younger bodies process alcohol faster.
            </Text>
            <TextInput
              style={styles.largeInput}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="21"
              placeholderTextColor="#444"
              maxLength={3}
              textAlign="center"
            />
            <Text style={styles.unitLabel}>years old</Text>
            <TouchableOpacity
              style={[styles.nextButton, !age && styles.nextButtonDisabled]}
              onPress={() => age && setStep(1)}
              disabled={!age}>
              <Text style={styles.nextButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>STEP 2 OF 3</Text>
            <Text style={styles.stepTitle}>What's your weight?</Text>
            <Text style={styles.stepSubtitle}>
              A 120 lb person reaches 0.08 BAC with just 2 drinks.{'\n'}
              A 200 lb person needs 4-5 for the same effect.
            </Text>
            <TextInput
              style={styles.largeInput}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="150"
              placeholderTextColor="#444"
              maxLength={3}
              textAlign="center"
            />
            <Text style={styles.unitLabel}>lbs</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(0)}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextButton, styles.nextButtonFlex, !weight && styles.nextButtonDisabled]}
                onPress={() => weight && setStep(2)}
                disabled={!weight}>
                <Text style={styles.nextButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>STEP 3 OF 3</Text>
            <Text style={styles.stepTitle}>What's your gender?</Text>
            <Text style={styles.stepSubtitle}>
              Women have less alcohol dehydrogenase enzyme{'\n'}
              and higher body fat %, leading to ~30% higher BAC.
            </Text>
            <View style={styles.genderGrid}>
              {genderOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.genderCard,
                    gender === opt.value && styles.genderCardActive,
                  ]}
                  onPress={() => setGender(opt.value)}>
                  <Text
                    style={[
                      styles.genderCardText,
                      gender === opt.value && styles.genderCardTextActive,
                    ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(1)}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextButton, styles.nextButtonFlex, !gender && styles.nextButtonDisabled]}
                onPress={handleComplete}
                disabled={!gender || saving}>
                {saving ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.nextButtonText}>Get Started</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 48,
  },
  progressDot: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#222',
  },
  progressDotActive: {
    backgroundColor: '#c9a96e',
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#555',
    letterSpacing: 3,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#f5f0eb',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  largeInput: {
    fontSize: 56,
    fontWeight: '200',
    color: '#f5f0eb',
    width: '100%',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    marginBottom: 8,
  },
  unitLabel: {
    fontSize: 14,
    color: '#555',
    letterSpacing: 2,
    marginBottom: 48,
  },
  genderGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 48,
    width: '100%',
  },
  genderCard: {
    flex: 1,
    paddingVertical: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  genderCardActive: {
    borderColor: '#c9a96e',
    backgroundColor: 'rgba(201, 169, 110, 0.08)',
  },
  genderCardText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#666',
    letterSpacing: 1,
  },
  genderCardTextActive: {
    color: '#c9a96e',
  },
  nextButton: {
    backgroundColor: '#c9a96e',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
  },
  nextButtonFlex: {
    flex: 1,
  },
  nextButtonDisabled: {
    opacity: 0.3,
  },
  nextButtonText: {
    color: '#0a0a0f',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  backButton: {
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#222',
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '400',
  },
});
