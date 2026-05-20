import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {onUserProfileChange, updateUserProfile, signOut, getDrinkHistory, getCurrentUser, deleteAccount} from '../services/firebase';
import {getInitials} from '../utils/helpers';
import {getAchievements, Achievement} from '../utils/achievements';
import {getDrinkGoal, setDrinkGoal, DrinkGoal} from '../utils/drinkGoal';
import {UserProfile} from '../types';

export default function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [realName, setRealName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [saving, setSaving] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goal, setGoal] = useState<DrinkGoal>({maxDrinks: 0, maxCalories: 0, maxSpending: 0});
  const [goalDrinks, setGoalDrinks] = useState('');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;
    const unsub = onUserProfileChange(user.uid, p => {
      if (p) {
        setProfile(p);
        setUsername(p.username);
        setRealName(p.realName);
        setAge(String(p.age));
        setWeight(String(p.weight));
        setGender(p.gender);
      }
    });
    // Load goal
    getDrinkGoal().then(g => {
      setGoal(g);
      setGoalDrinks(g.maxDrinks > 0 ? String(g.maxDrinks) : '');
    });
    // Load achievements
    getDrinkHistory(user.uid, 365).then(history => {
      const totalDrinks = history.reduce((sum, h) => sum + h.drinkCount, 0);
      const drinkDates = new Set(history.map(h => h.date));
      let soberDays = 0;
      const d = new Date();
      d.setDate(d.getDate() - 1);
      while (soberDays < 365) {
        if (drinkDates.has(d.toISOString().split('T')[0])) break;
        soberDays++;
        d.setDate(d.getDate() - 1);
      }
      setAchievements(getAchievements(history, soberDays, totalDrinks));
    });
    return unsub;
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        username, realName,
        age: parseInt(age, 10) || 21,
        weight: parseInt(weight, 10) || 150,
        gender,
      });
      Alert.alert('', 'Profile updated');
    } catch (e: any) {
      Alert.alert('', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: () => signOut()},
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This permanently deletes your profile, drinks, friends, groups, and alerts. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'Tap Delete again to permanently erase your account.',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteAccount();
                    } catch (e: any) {
                      if (e.code === 'auth/requires-recent-login') {
                        Alert.alert(
                          'Sign in again',
                          'For your security, please sign out and sign back in, then try deleting your account again.',
                        );
                      } else {
                        Alert.alert('', e.message || 'Could not delete account');
                      }
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={[s.content, {paddingTop: insets.top + 16}]}>
      <Text style={s.title}>SETTINGS</Text>

      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {profile ? getInitials(profile.username) : '?'}
          </Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.sectionLabel}>PROFILE</Text>

        <Text style={s.fieldLabel}>USERNAME</Text>
        <TextInput style={s.input} value={username} onChangeText={setUsername} placeholderTextColor="#333" autoCapitalize="none" />

        <Text style={s.fieldLabel}>FULL NAME</Text>
        <TextInput style={s.input} value={realName} onChangeText={setRealName} placeholderTextColor="#333" />

        <Text style={s.fieldLabel}>AGE</Text>
        <TextInput style={s.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholderTextColor="#333" />

        <Text style={s.fieldLabel}>WEIGHT (LBS)</Text>
        <TextInput style={s.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholderTextColor="#333" />

        <Text style={s.fieldLabel}>GENDER</Text>
        <View style={s.genderRow}>
          {(['Male', 'Female', 'Other'] as const).map(g => (
            <TouchableOpacity
              key={g}
              style={[s.genderOption, gender === g && s.genderActive]}
              onPress={() => setGender(g)}>
              <Text style={[s.genderText, gender === g && s.genderTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Drink Goal */}
      <View style={[s.card, {marginTop: 0}]}>
        <Text style={s.sectionLabel}>SESSION LIMIT</Text>
        <Text style={s.goalSubtitle}>Set a max drinks per night goal</Text>
        <View style={s.goalRow}>
          {[0, 3, 4, 5, 6, 8].map(n => (
            <TouchableOpacity
              key={n}
              style={[s.goalChip, goal.maxDrinks === n && s.goalChipActive]}
              onPress={async () => {
                const updated = await setDrinkGoal({maxDrinks: n});
                setGoal(updated);
                setGoalDrinks(n > 0 ? String(n) : '');
              }}>
              <Text style={[s.goalChipText, goal.maxDrinks === n && s.goalChipTextActive]}>
                {n === 0 ? 'None' : n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {goal.maxDrinks > 0 && (
          <Text style={s.goalActive}>
            Limit: {goal.maxDrinks} drinks per session
          </Text>
        )}
      </View>

      <TouchableOpacity style={s.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={s.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>

      {/* Achievements */}
      {achievements.length > 0 && (
        <View style={[s.card, {marginTop: 24}]}>
          <Text style={s.sectionLabel}>
            ACHIEVEMENTS · {achievements.filter(a => a.earned).length}/{achievements.length}
          </Text>
          <View style={s.achieveGrid}>
            {achievements.map(a => (
              <View key={a.id} style={[s.achieveItem, !a.earned && s.achieveLocked]}>
                <Text style={[s.achieveEmoji, !a.earned && s.achieveEmojiLocked]}>
                  {a.earned ? a.emoji : '🔒'}
                </Text>
                <Text style={[s.achieveTitle, !a.earned && s.achieveTitleLocked]}>
                  {a.title}
                </Text>
                <Text style={s.achieveDesc}>{a.description}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity style={[s.signOutButton, {marginTop: 24}]} onPress={handleSignOut}>
        <Text style={s.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.deleteButton, {marginTop: 12}]} onPress={handleDeleteAccount}>
        <Text style={s.deleteText}>Delete Account</Text>
      </TouchableOpacity>

      {/* About */}
      <View style={[s.card, {marginTop: 24}]}>
        <Text style={s.sectionLabel}>ABOUT TIPSY</Text>
        <Text style={s.aboutText}>
          Tipsy is a drink-tracking app for logging what you drink, watching
          calories and spending, pacing your night, and sharing progress with
          friends. Tipsy does not estimate intoxication or fitness to drive.
          Never drive after drinking.
        </Text>
        <Text style={[s.aboutText, {marginTop: 12}]}>
          Calorie data sourced from USDA FoodData Central and brand nutrition labels.
          Drink prices are US national bar averages.
        </Text>
      </View>

      <View style={[s.card, {marginTop: 0}]}>
        <Text style={s.sectionLabel}>LEGAL</Text>
        <TouchableOpacity style={s.legalRow} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={s.legalText}>Privacy Policy</Text>
          <Text style={s.legalChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.versionText}>Tipsy v1.0.0</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0f'},
  content: {paddingHorizontal: 24, paddingBottom: 120},
  title: {fontSize: 12, fontWeight: '400', color: '#f5f0eb', letterSpacing: 6, marginBottom: 28},
  avatarSection: {alignItems: 'center', marginBottom: 32},
  avatar: {width: 72, height: 72, borderRadius: 36, backgroundColor: '#111116', borderWidth: 0.5, borderColor: '#c9a96e', alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: '#c9a96e', fontSize: 24, fontWeight: '200'},
  card: {backgroundColor: '#111116', borderRadius: 2, padding: 24, marginBottom: 24, borderWidth: 0.5, borderColor: '#1a1a1f'},
  sectionLabel: {fontSize: 10, fontWeight: '500', color: '#555', letterSpacing: 3, marginBottom: 24},
  fieldLabel: {fontSize: 10, color: '#444', letterSpacing: 2, marginBottom: 8},
  input: {borderBottomWidth: 0.5, borderBottomColor: '#1e1e25', paddingVertical: 12, fontSize: 16, color: '#f5f0eb', fontWeight: '300', marginBottom: 20},
  genderRow: {flexDirection: 'row', gap: 10},
  genderOption: {flex: 1, paddingVertical: 16, borderWidth: 0.5, borderColor: '#1e1e25', alignItems: 'center', borderRadius: 2},
  genderActive: {borderColor: '#c9a96e', backgroundColor: 'rgba(201,169,110,0.06)'},
  genderText: {color: '#555', fontSize: 13, letterSpacing: 1, fontWeight: '400'},
  genderTextActive: {color: '#c9a96e'},
  saveButton: {backgroundColor: '#c9a96e', paddingVertical: 18, alignItems: 'center', marginBottom: 12},
  saveText: {color: '#0a0a0f', fontSize: 13, fontWeight: '600', letterSpacing: 2},
  signOutButton: {borderWidth: 0.5, borderColor: '#1e1e25', paddingVertical: 18, alignItems: 'center'},
  signOutText: {color: '#555', fontSize: 13, fontWeight: '400', letterSpacing: 2},
  deleteButton: {borderWidth: 0.5, borderColor: '#8b202060', paddingVertical: 18, alignItems: 'center'},
  deleteText: {color: '#8b2020', fontSize: 13, fontWeight: '400', letterSpacing: 2},

  goalSubtitle: {color: '#444', fontSize: 11, marginBottom: 14},
  goalRow: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
  goalChip: {paddingHorizontal: 16, paddingVertical: 10, borderWidth: 0.5, borderColor: '#1e1e25', borderRadius: 2},
  goalChipActive: {borderColor: '#c9a96e', backgroundColor: 'rgba(201,169,110,0.08)'},
  goalChipText: {color: '#555', fontSize: 13, fontWeight: '400'},
  goalChipTextActive: {color: '#c9a96e'},
  goalActive: {color: '#c9a96e', fontSize: 11, marginTop: 14, letterSpacing: 0.5},

  achieveGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  achieveItem: {width: '47%', backgroundColor: '#0e0e14', borderRadius: 2, padding: 14, borderWidth: 0.5, borderColor: '#c9a96e20'},
  achieveLocked: {borderColor: '#1a1a1f', opacity: 0.5},
  achieveEmoji: {fontSize: 22, marginBottom: 6},
  achieveEmojiLocked: {opacity: 0.4},
  achieveTitle: {color: '#f5f0eb', fontSize: 12, fontWeight: '400', marginBottom: 2},
  achieveTitleLocked: {color: '#555'},
  achieveDesc: {color: '#444', fontSize: 10, lineHeight: 14},

  aboutText: {color: '#555', fontSize: 12, lineHeight: 18, fontWeight: '300'},
  versionText: {color: '#222', fontSize: 10, textAlign: 'center', marginTop: 32, letterSpacing: 2, marginBottom: 20},
  legalRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4},
  legalText: {color: '#f5f0eb', fontSize: 14, fontWeight: '300'},
  legalChevron: {color: '#555', fontSize: 20, fontWeight: '300'},
});
