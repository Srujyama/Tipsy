import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[s.container, {paddingTop: insets.top}]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <Text style={s.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>PRIVACY</Text>
        <View style={s.backButton} />
      </View>

      <ScrollView contentContainerStyle={[s.content, {paddingBottom: insets.bottom + 40}]}>
        <Text style={s.title}>TIPSY PRIVACY POLICY</Text>
        <Text style={s.meta}>LAST UPDATED · APRIL 16, 2026</Text>

        <Text style={s.body}>
          Tipsy is a drink-tracking app that helps you log drinks, watch calories
          and spending, pace your night, and share progress with friends. This
          policy explains what we collect, why, and who we share it with.
        </Text>

        <Text style={s.sectionHeader}>1. INFORMATION WE COLLECT</Text>
        <Text style={s.body}>When you create an account, we collect:</Text>
        <Text style={s.bullet}>· Email address (for sign-in)</Text>
        <Text style={s.bullet}>· Username and name (shown to friends)</Text>
        <Text style={s.bullet}>· Age, weight, and gender (used to confirm eligibility and personalize tips)</Text>
        <Text style={[s.body, {marginTop: 12}]}>While you use the app, we store:</Text>
        <Text style={s.bullet}>· Drinks you log — type, size, alcohol content, calories, and timestamp</Text>
        <Text style={s.bullet}>· Friends and groups — who you've connected with and joined</Text>
        <Text style={s.bullet}>· Safety alerts — manual notifications you choose to send to friends</Text>
        <Text style={[s.body, {marginTop: 12}]}>
          We do not collect: location, contacts, photos, microphone, camera, browsing activity,
          or advertising identifiers.
        </Text>

        <Text style={s.sectionHeader}>2. HOW WE USE YOUR INFORMATION</Text>
        <Text style={s.bullet}>· Show your drink history, streaks, calories, and spending</Text>
        <Text style={s.bullet}>· Pace alerts and hangover-risk tips based on your logged drinks</Text>
        <Text style={s.bullet}>· Let you share drink counts and safety alerts with friends you've added</Text>
        <Text style={s.bullet}>· Surface ride-share apps (Uber, Lyft) — these are plain app links; we do not send your data to them</Text>
        <Text style={[s.body, {marginTop: 12}]}>
          We do not sell your data, use it for advertising, or share it with advertisers.
        </Text>

        <Text style={s.sectionHeader}>3. WHO HAS ACCESS</Text>
        <Text style={s.bullet}>· You — full access through the app</Text>
        <Text style={s.bullet}>· Friends and group members — can see your username, real name, and aggregate drink counts (daily/weekly/monthly totals). They cannot see the details of individual drinks.</Text>
        <Text style={s.bullet}>· Google Firebase — our backend provider, which stores the data on our behalf</Text>
        <Text style={s.bullet}>· Google Sign-In — if you use it, Google provides us your display name and email</Text>
        <Text style={s.bullet}>· Sign in with Apple — if you use it, Apple provides us a unique ID and (optionally) a private relay email</Text>
        <Text style={[s.body, {marginTop: 12}]}>
          We do not use Firebase Analytics or Firebase Ads; both are disabled.
        </Text>

        <Text style={s.sectionHeader}>4. DATA RETENTION</Text>
        <Text style={s.body}>
          We keep your data for as long as your account is active. You can delete
          your account at any time from Settings → Delete Account. We immediately
          remove your profile, drinks, friend connections, group memberships, and
          alerts. You can also email us to request deletion.
        </Text>

        <Text style={s.sectionHeader}>5. YOUR RIGHTS</Text>
        <Text style={s.bullet}>· View and edit your profile, drinks, and friends directly in the app</Text>
        <Text style={s.bullet}>· Delete your account in-app from Settings → Delete Account</Text>
        <Text style={s.bullet}>· Request a copy of your data by emailing us</Text>
        <Text style={[s.body, {marginTop: 12}]}>
          If you live in the EU, UK, or California, you have additional rights under GDPR,
          UK GDPR, and CCPA.
        </Text>

        <Text style={s.sectionHeader}>6. CHILDREN</Text>
        <Text style={s.body}>
          Tipsy is intended for users of legal drinking age in their jurisdiction. We do
          not knowingly collect data from children under 13.
        </Text>

        <Text style={s.sectionHeader}>7. SECURITY</Text>
        <Text style={s.body}>
          We use Firebase's standard security (TLS in transit, encryption at rest,
          Firestore security rules). No system is perfectly secure, but we take reasonable
          steps to protect your information.
        </Text>

        <Text style={s.sectionHeader}>8. CHANGES</Text>
        <Text style={s.body}>
          We may update this policy. The "Last updated" date will change, and material
          changes will be announced in the app.
        </Text>

        <Text style={s.sectionHeader}>9. CONTACT</Text>
        <Text style={s.body}>Questions or requests: srujanyamali@gmail.com</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0f'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1f',
  },
  backButton: {minWidth: 60},
  backText: {color: '#c9a96e', fontSize: 11, letterSpacing: 2, fontWeight: '400'},
  headerTitle: {color: '#f5f0eb', fontSize: 12, letterSpacing: 6, fontWeight: '400'},
  content: {paddingHorizontal: 24, paddingTop: 24},
  title: {color: '#c9a96e', fontSize: 16, letterSpacing: 4, fontWeight: '300', marginBottom: 6},
  meta: {color: '#555', fontSize: 10, letterSpacing: 2, marginBottom: 28},
  sectionHeader: {
    color: '#c9a96e',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '500',
    marginTop: 28,
    marginBottom: 12,
  },
  body: {color: '#f5f0eb', fontSize: 14, lineHeight: 22, fontWeight: '300'},
  bullet: {color: '#f5f0eb', fontSize: 14, lineHeight: 22, fontWeight: '300', marginTop: 6, paddingLeft: 4},
});
