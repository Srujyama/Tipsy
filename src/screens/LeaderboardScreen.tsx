import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getLeaderboard, onUserGroups, getCurrentUser} from '../services/firebase';
import {getInitials} from '../utils/helpers';
import {UserProfile, Group} from '../types';

type Period = 'daily' | 'weekly' | 'monthly';

export default function LeaderboardScreen({route, navigation}: any) {
  const [period, setPeriod] = useState<Period>('daily');
  const [entries, setEntries] = useState<{user: UserProfile; drinkCount: number}[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(route?.params?.groupId || null);
  const insets = useSafeAreaInsets();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;
    const unsub = onUserGroups(user.uid, g => {
      setGroups(g);
      if (!selectedGroupId && g.length > 0) setSelectedGroupId(g[0].id);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (selectedGroupId) getLeaderboard(selectedGroupId, period).then(setEntries);
  }, [selectedGroupId, period]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const periods: {key: Period; label: string}[] = [
    {key: 'daily', label: 'DAILY'},
    {key: 'weekly', label: 'WEEKLY'},
    {key: 'monthly', label: 'MONTHLY'},
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={[s.content, {paddingTop: insets.top + 16}]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backBtn}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={s.title}>LEADERBOARD</Text>
        <View style={{width: 24}} />
      </View>
      {selectedGroup && <Text style={s.groupName}>{selectedGroup.name}</Text>}

      {/* Period tabs */}
      <View style={s.periodRow}>
        {periods.map(p => (
          <TouchableOpacity key={p.key} style={s.periodTab} onPress={() => setPeriod(p.key)}>
            <Text style={[s.periodText, period === p.key && s.periodActive]}>{p.label}</Text>
            {period === p.key && <View style={s.periodIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Podium */}
      {entries.length > 0 && (
        <View style={s.podiumCard}>
          <View style={s.podiumRow}>
            {entries.length > 1 && (
              <View style={s.podiumItem}>
                <Text style={s.podiumRank}>2</Text>
                <View style={s.podiumAvatar}><Text style={s.podiumAvatarText}>{getInitials(entries[1].user.username)}</Text></View>
                <Text style={s.podiumName}>@{entries[1].user.username}</Text>
                <Text style={s.podiumDrinks}>{entries[1].drinkCount}</Text>
                <View style={[s.podiumBar, {height: 48}]} />
              </View>
            )}
            <View style={s.podiumItem}>
              <Text style={[s.podiumRank, s.goldText]}>1</Text>
              <View style={[s.podiumAvatar, s.podiumAvatarFirst]}><Text style={[s.podiumAvatarText, s.goldText]}>{getInitials(entries[0].user.username)}</Text></View>
              <Text style={s.podiumName}>@{entries[0].user.username}</Text>
              <Text style={[s.podiumDrinks, s.goldText]}>{entries[0].drinkCount}</Text>
              <View style={[s.podiumBar, s.podiumBarFirst, {height: 72}]} />
            </View>
            {entries.length > 2 && (
              <View style={s.podiumItem}>
                <Text style={s.podiumRank}>3</Text>
                <View style={s.podiumAvatar}><Text style={s.podiumAvatarText}>{getInitials(entries[2].user.username)}</Text></View>
                <Text style={s.podiumName}>@{entries[2].user.username}</Text>
                <Text style={s.podiumDrinks}>{entries[2].drinkCount}</Text>
                <View style={[s.podiumBar, {height: 32}]} />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Full list */}
      <Text style={s.sectionLabel}>ALL MEMBERS</Text>
      {entries.map((entry, i) => (
        <View key={entry.user.uid} style={s.listRow}>
          <Text style={[s.listRank, i === 0 && s.goldText]}>{i + 1}</Text>
          <View style={[s.listAvatar, i === 0 && {borderColor: '#c9a96e', borderWidth: 0.5}]}>
            <Text style={s.listAvatarText}>{getInitials(entry.user.username)}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={s.listName}>
              @{entry.user.username}
              {entry.user.uid === user?.uid && <Text style={s.goldText}> You</Text>}
            </Text>
          </View>
          <Text style={[s.listCount, i === 0 && s.goldText]}>{entry.drinkCount}</Text>
        </View>
      ))}
      {entries.length === 0 && <Text style={s.emptyText}>{groups.length === 0 ? 'Join a group to see the leaderboard' : 'No drinks logged yet'}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0f'},
  content: {paddingHorizontal: 24, paddingBottom: 120},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8},
  backBtn: {color: '#f5f0eb', fontSize: 22, fontWeight: '200'},
  title: {fontSize: 12, fontWeight: '400', color: '#f5f0eb', letterSpacing: 6},
  groupName: {color: '#555', fontSize: 12, letterSpacing: 2, textAlign: 'center', marginBottom: 24},
  periodRow: {flexDirection: 'row', justifyContent: 'center', gap: 32, marginBottom: 28},
  periodTab: {alignItems: 'center'},
  periodText: {fontSize: 10, color: '#444', letterSpacing: 2, fontWeight: '500'},
  periodActive: {color: '#c9a96e'},
  periodIndicator: {width: 16, height: 1.5, backgroundColor: '#c9a96e', marginTop: 8},
  podiumCard: {backgroundColor: '#111116', borderRadius: 2, padding: 24, marginBottom: 28, borderWidth: 0.5, borderColor: '#1a1a1f'},
  podiumRow: {flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 20},
  podiumItem: {alignItems: 'center', width: 80},
  podiumRank: {color: '#555', fontSize: 12, letterSpacing: 1, marginBottom: 8},
  goldText: {color: '#c9a96e'},
  podiumAvatar: {width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a1a22', alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  podiumAvatarFirst: {borderWidth: 0.5, borderColor: '#c9a96e', width: 52, height: 52, borderRadius: 26},
  podiumAvatarText: {color: '#888', fontSize: 14, fontWeight: '400'},
  podiumName: {color: '#f5f0eb', fontSize: 11, fontWeight: '300', marginBottom: 4},
  podiumDrinks: {color: '#555', fontSize: 16, fontWeight: '200', marginBottom: 12},
  podiumBar: {width: '100%', backgroundColor: '#1a1a22', borderRadius: 1},
  podiumBarFirst: {backgroundColor: 'rgba(201,169,110,0.15)'},
  sectionLabel: {fontSize: 10, fontWeight: '500', color: '#555', letterSpacing: 3, marginBottom: 16},
  listRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1f'},
  listRank: {color: '#555', fontSize: 14, fontWeight: '300', width: 24},
  listAvatar: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a22', alignItems: 'center', justifyContent: 'center', marginRight: 12},
  listAvatarText: {color: '#888', fontSize: 12, fontWeight: '500'},
  listName: {color: '#f5f0eb', fontSize: 14, fontWeight: '300'},
  listCount: {color: '#888', fontSize: 18, fontWeight: '200'},
  emptyText: {color: '#333', textAlign: 'center', marginTop: 48, fontSize: 13, letterSpacing: 0.5},
});
