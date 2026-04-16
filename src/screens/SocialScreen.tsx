import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  onFriends, getCurrentUser, onFriendRequests, searchUsers,
  sendFriendRequest, acceptFriendRequest, onUserGroups, createGroup,
  joinGroup, leaveGroup, getGroupMembers, onUserProfileChange, sendSafetyAlert,
} from '../services/firebase';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getInitials} from '../utils/helpers';
import {UserProfile, FriendRequest, Group} from '../types';

type Tab = 'Friends' | 'Requests' | 'Groups' | 'Alert';

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('Friends');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<UserProfile[]>([]);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;
    const unsub1 = onUserProfileChange(user.uid, setProfile);
    const unsub2 = onFriends(user.uid, setFriends);
    const unsub3 = onFriendRequests(user.uid, setRequests);
    const unsub4 = onUserGroups(user.uid, setGroups);
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [user]);

  useEffect(() => {
    if (selectedGroup) getGroupMembers(selectedGroup.memberIds).then(setGroupMembers);
  }, [selectedGroup]);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    const results = await searchUsers(searchQuery);
    setSearchResults(results.filter(u => u.uid !== user?.uid));
  };

  const handleSendRequest = async (toUser: UserProfile) => {
    if (!user || !profile) return;
    try {
      await sendFriendRequest(user.uid, profile.username, toUser.uid);
      Alert.alert('', `Request sent to @${toUser.username}`);
    } catch (e: any) { Alert.alert('', e.message); }
  };

  const handleAcceptRequest = async (req: FriendRequest) => {
    if (!user) return;
    try { await acceptFriendRequest(req.id, req.fromUid, user.uid); }
    catch (e: any) { Alert.alert('', e.message); }
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) return;
    try { await createGroup(newGroupName.trim(), user.uid); setNewGroupName(''); }
    catch (e: any) { Alert.alert('', e.message); }
  };

  const handleJoinGroup = async () => {
    if (!user || !inviteCode.trim()) return;
    try {
      const group = await joinGroup(inviteCode.trim(), user.uid);
      if (!group) { Alert.alert('', 'Invalid invite code'); return; }
      setInviteCode('');
    } catch (e: any) { Alert.alert('', e.message); }
  };

  const handleLeaveGroup = (group: Group) => {
    if (!user) return;
    Alert.alert('Leave Group', `Leave ${group.name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Leave', style: 'destructive', onPress: () => { leaveGroup(group.id, user.uid); setSelectedGroup(null); }},
    ]);
  };

  const handleSafetyAlert = () => {
    if (!user || !profile) return;
    Alert.alert('Safety Alert', 'Notify all friends that you need help?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Send', style: 'destructive', onPress: () => {
        sendSafetyAlert(user.uid, profile.username, 0);
        Alert.alert('', 'Your friends have been notified');
      }},
    ]);
  };

  const tabs: Tab[] = ['Friends', 'Requests', 'Groups', 'Alert'];

  return (
    <ScrollView style={st.container} contentContainerStyle={[st.content, {paddingTop: insets.top + 16}]}>
      <Text style={st.title}>SOCIAL</Text>

      {/* Tabs */}
      <View style={st.tabRow}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab} style={st.tab} onPress={() => { setActiveTab(tab); setSelectedGroup(null); }}>
            <Text style={[st.tabText, activeTab === tab && st.tabTextActive]}>{tab.toUpperCase()}</Text>
            {activeTab === tab && <View style={st.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Friends */}
      {activeTab === 'Friends' && (
        <View>
          <TextInput
            style={st.searchInput}
            placeholder="Search by username"
            placeholderTextColor="#333"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchResults.map(u => (
            <View key={u.uid} style={st.row}>
              <View style={st.avatar}><Text style={st.avatarText}>{getInitials(u.username)}</Text></View>
              <View style={{flex: 1}}><Text style={st.nameText}>@{u.username}</Text><Text style={st.subText}>{u.realName}</Text></View>
              <TouchableOpacity onPress={() => handleSendRequest(u)}><Text style={st.goldLink}>Add</Text></TouchableOpacity>
            </View>
          ))}
          <Text style={st.sectionLabel}>YOUR SQUAD · {friends.length}</Text>
          {friends.map(f => (
            <View key={f.uid} style={st.row}>
              <View style={st.avatar}><Text style={st.avatarText}>{getInitials(f.username)}</Text></View>
              <View style={{flex: 1}}><Text style={st.nameText}>@{f.username}</Text><Text style={st.subText}>{f.realName}</Text></View>
            </View>
          ))}
          {friends.length === 0 && <Text style={st.emptyText}>No friends yet. Search to add some.</Text>}
        </View>
      )}

      {/* Requests */}
      {activeTab === 'Requests' && (
        <View>
          {requests.length === 0 ? <Text style={st.emptyText}>No pending requests</Text> : requests.map(req => (
            <View key={req.id} style={st.row}>
              <View style={st.avatar}><Text style={st.avatarText}>{getInitials(req.fromUsername)}</Text></View>
              <View style={{flex: 1}}><Text style={st.nameText}>@{req.fromUsername}</Text></View>
              <TouchableOpacity style={st.acceptBtn} onPress={() => handleAcceptRequest(req)}>
                <Text style={st.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Groups */}
      {activeTab === 'Groups' && !selectedGroup && (
        <View>
          <TextInput style={st.searchInput} placeholder="Group name" placeholderTextColor="#333" value={newGroupName} onChangeText={setNewGroupName} />
          <TouchableOpacity style={st.goldButton} onPress={handleCreateGroup}>
            <Text style={st.goldButtonText}>Create Group</Text>
          </TouchableOpacity>

          <Text style={[st.sectionLabel, {marginTop: 28}]}>JOIN WITH CODE</Text>
          <View style={{flexDirection: 'row', gap: 12}}>
            <TextInput style={[st.searchInput, {flex: 1, marginBottom: 0}]} placeholder="INVITE CODE" placeholderTextColor="#333" value={inviteCode} onChangeText={setInviteCode} autoCapitalize="characters" />
            <TouchableOpacity style={st.joinBtn} onPress={handleJoinGroup}><Text style={st.joinBtnText}>Join</Text></TouchableOpacity>
          </View>

          <Text style={[st.sectionLabel, {marginTop: 28}]}>YOUR GROUPS</Text>
          {groups.map(g => (
            <TouchableOpacity key={g.id} style={st.row} onPress={() => setSelectedGroup(g)}>
              <View style={st.avatar}><Text style={st.avatarText}>{getInitials(g.name)}</Text></View>
              <View style={{flex: 1}}><Text style={st.nameText}>{g.name}</Text><Text style={st.subText}>{g.memberIds.length} members</Text></View>
              <Text style={st.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Group Detail */}
      {activeTab === 'Groups' && selectedGroup && (
        <View>
          <TouchableOpacity onPress={() => setSelectedGroup(null)}>
            <Text style={st.backText}>← {selectedGroup.name}</Text>
          </TouchableOpacity>
          <View style={[st.card, {marginTop: 16}]}>
            <Text style={st.sectionLabel}>INVITE CODE</Text>
            <Text style={st.inviteCode}>{selectedGroup.inviteCode}</Text>
            <TouchableOpacity onPress={() => { Clipboard.setString(selectedGroup.inviteCode); Alert.alert('', 'Copied'); }}>
              <Text style={st.goldLink}>Copy</Text>
            </TouchableOpacity>
          </View>
          <Text style={st.sectionLabel}>MEMBERS · {groupMembers.length}</Text>
          {groupMembers.map(m => (
            <View key={m.uid} style={st.row}>
              <View style={st.avatar}><Text style={st.avatarText}>{getInitials(m.username)}</Text></View>
              <View style={{flex: 1}}>
                <Text style={st.nameText}>@{m.username}{m.uid === user?.uid ? <Text style={st.goldLink}> You</Text> : null}</Text>
              </View>
              {m.uid === selectedGroup.hostId && <Text style={st.goldLink}>Host</Text>}
            </View>
          ))}
          <TouchableOpacity style={[st.signOutButton, {marginTop: 20}]} onPress={() => handleLeaveGroup(selectedGroup)}>
            <Text style={st.signOutText}>Leave Group</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Alert */}
      {activeTab === 'Alert' && (
        <View>
          <View style={st.card}>
            <Text style={[st.nameText, {fontSize: 18, marginBottom: 8}]}>Safety Alert</Text>
            <Text style={st.subText}>Sends a notification to all your friends with your status. Use if you feel unsafe or need a pickup.</Text>
            <TouchableOpacity style={[st.goldButton, {marginTop: 24, backgroundColor: '#8b2020'}]} onPress={handleSafetyAlert}>
              <Text style={st.goldButtonText}>Send Safety Alert</Text>
            </TouchableOpacity>
          </View>
          <View style={[st.card, {marginTop: 16}]}>
            <Text style={st.nameText}>Emergency Contacts</Text>
            <Text style={[st.subText, {marginTop: 8}]}>National Alcohol Hotline: 1-800-662-4357</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0f'},
  content: {paddingHorizontal: 24, paddingBottom: 120},
  title: {fontSize: 12, fontWeight: '400', color: '#f5f0eb', letterSpacing: 6, marginBottom: 20},
  tabRow: {flexDirection: 'row', marginBottom: 24, gap: 24},
  tab: {alignItems: 'center'},
  tabText: {fontSize: 10, color: '#444', letterSpacing: 2, fontWeight: '500'},
  tabTextActive: {color: '#c9a96e'},
  tabIndicator: {width: 16, height: 1.5, backgroundColor: '#c9a96e', marginTop: 8},
  searchInput: {borderBottomWidth: 0.5, borderBottomColor: '#1e1e25', paddingVertical: 14, fontSize: 15, color: '#f5f0eb', fontWeight: '300', marginBottom: 24},
  sectionLabel: {fontSize: 10, fontWeight: '500', color: '#555', letterSpacing: 3, marginBottom: 16},
  row: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1f'},
  avatar: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a22', alignItems: 'center', justifyContent: 'center', marginRight: 14},
  avatarText: {color: '#888', fontSize: 12, fontWeight: '500'},
  nameText: {color: '#f5f0eb', fontSize: 14, fontWeight: '300'},
  subText: {color: '#444', fontSize: 12, marginTop: 2},
  goldLink: {color: '#c9a96e', fontSize: 12, letterSpacing: 1},
  emptyText: {color: '#333', textAlign: 'center', marginTop: 48, fontSize: 13, letterSpacing: 0.5},
  acceptBtn: {backgroundColor: '#c9a96e', paddingHorizontal: 16, paddingVertical: 8},
  acceptBtnText: {color: '#0a0a0f', fontSize: 11, fontWeight: '600', letterSpacing: 1},
  goldButton: {backgroundColor: '#c9a96e', paddingVertical: 16, alignItems: 'center'},
  goldButtonText: {color: '#0a0a0f', fontSize: 12, fontWeight: '600', letterSpacing: 2},
  joinBtn: {backgroundColor: '#c9a96e', paddingHorizontal: 24, justifyContent: 'center'},
  joinBtnText: {color: '#0a0a0f', fontSize: 12, fontWeight: '600', letterSpacing: 1},
  chevron: {color: '#444', fontSize: 20},
  backText: {color: '#f5f0eb', fontSize: 16, fontWeight: '300'},
  card: {backgroundColor: '#111116', borderRadius: 2, padding: 24, borderWidth: 0.5, borderColor: '#1a1a1f'},
  inviteCode: {fontSize: 28, fontWeight: '200', color: '#c9a96e', letterSpacing: 6, marginBottom: 8},
  signOutButton: {borderWidth: 0.5, borderColor: '#1e1e25', paddingVertical: 16, alignItems: 'center'},
  signOutText: {color: '#555', fontSize: 12, letterSpacing: 2},
});
