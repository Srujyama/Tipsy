import {auth, db} from './firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  limit,
} from 'firebase/firestore';
import {UserProfile, DrinkLog, Group, FriendRequest} from '../types';
import {generateInviteCode} from '../utils/helpers';
import {getStandardDrinks, getDrinkCalories, DRINK_PRESETS} from '../utils/bac';

export interface DrinkSession {
  date: string; // 'YYYY-MM-DD'
  drinks: DrinkLog[];
  totalCalories: number;
  drinkCount: number;
}

// Auth functions
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function onAuthStateChanged(callback: (user: User | null) => void) {
  return firebaseOnAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}

// User profile functions
export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  return setDoc(doc(db, 'users', uid), {
    ...data,
    uid,
    createdAt: Date.now(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  return updateDoc(doc(db, 'users', uid), data);
}

export function onUserProfileChange(uid: string, callback: (profile: UserProfile | null) => void) {
  return onSnapshot(doc(db, 'users', uid), snap => {
    callback(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

// Drink logging functions
export async function logDrink(userId: string, type: keyof typeof DRINK_PRESETS) {
  const preset = DRINK_PRESETS[type];
  const standardDrinks = getStandardDrinks(preset.oz, preset.abv);
  const calories = getDrinkCalories(type);

  return addDoc(collection(db, 'drinks'), {
    userId,
    type,
    oz: preset.oz,
    abv: preset.abv,
    standardDrinks,
    calories,
    timestamp: Date.now(),
  });
}

export async function logCustomDrink(userId: string, name: string, oz: number, abv: number, calories: number) {
  const standardDrinks = getStandardDrinks(oz, abv);
  return addDoc(collection(db, 'drinks'), {
    userId,
    type: 'custom',
    customName: name,
    oz,
    abv,
    standardDrinks,
    calories,
    timestamp: Date.now(),
  });
}

export async function removeDrink(drinkId: string) {
  return deleteDoc(doc(db, 'drinks', drinkId));
}

// Get past drinking sessions (grouped by date)
export async function getDrinkHistory(userId: string, daysBack: number = 30): Promise<DrinkSession[]> {
  try {
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  const q = query(
    collection(db, 'drinks'),
    where('userId', '==', userId),
    where('timestamp', '>=', cutoff),
    orderBy('timestamp', 'desc'),
  );
  const snapshot = await getDocs(q);
  const allDrinks = snapshot.docs.map(d => ({id: d.id, ...d.data()} as DrinkLog));

  // Group by date
  const grouped: Record<string, DrinkLog[]> = {};
  for (const drink of allDrinks) {
    const date = new Date(drink.timestamp);
    // If before 6am, count as previous day's session
    if (date.getHours() < 6) date.setDate(date.getDate() - 1);
    const key = date.toISOString().split('T')[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(drink);
  }

  return Object.entries(grouped)
    .map(([date, drinks]) => ({
      date,
      drinks,
      totalCalories: drinks.reduce((sum, d) => sum + d.calories, 0),
      drinkCount: drinks.length,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
  } catch (e) {
    console.warn('getDrinkHistory error (index may still be building):', e);
    return [];
  }
}

export function onTonightsDrinks(userId: string, callback: (drinks: DrinkLog[]) => void) {
  const cutoff = new Date();
  if (cutoff.getHours() < 6) {
    cutoff.setDate(cutoff.getDate() - 1);
    cutoff.setHours(18, 0, 0, 0);
  } else {
    cutoff.setHours(0, 0, 0, 0);
  }

  const q = query(
    collection(db, 'drinks'),
    where('userId', '==', userId),
    where('timestamp', '>=', cutoff.getTime()),
    orderBy('timestamp', 'desc'),
  );

  return onSnapshot(q, snapshot => {
    const drinks = snapshot.docs.map(d => ({id: d.id, ...d.data()} as DrinkLog));
    callback(drinks);
  }, error => {
    console.warn('onTonightsDrinks error (index may still be building):', error.message);
    callback([]);
  });
}

// Friends functions
export async function searchUsers(searchQuery: string): Promise<UserProfile[]> {
  const q = query(
    collection(db, 'users'),
    where('username', '>=', searchQuery),
    where('username', '<=', searchQuery + '\uf8ff'),
    limit(10),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => d.data() as UserProfile);
}

export async function sendFriendRequest(fromUid: string, fromUsername: string, toUid: string) {
  return addDoc(collection(db, 'friendRequests'), {
    fromUid,
    toUid,
    fromUsername,
    status: 'pending',
    timestamp: Date.now(),
  });
}

export function onFriendRequests(uid: string, callback: (requests: FriendRequest[]) => void) {
  const q = query(
    collection(db, 'friendRequests'),
    where('toUid', '==', uid),
    where('status', '==', 'pending'),
  );
  return onSnapshot(q, snapshot => {
    callback(snapshot.docs.map(d => ({id: d.id, ...d.data()} as FriendRequest)));
  });
}

export async function acceptFriendRequest(requestId: string, fromUid: string, toUid: string) {
  await updateDoc(doc(db, 'friendRequests', requestId), {status: 'accepted'});
  await setDoc(doc(db, 'friends', `${fromUid}_${toUid}`), {
    users: [fromUid, toUid],
    timestamp: Date.now(),
  });
}

export function onFriends(uid: string, callback: (friends: UserProfile[]) => void) {
  const q = query(collection(db, 'friends'), where('users', 'array-contains', uid));
  return onSnapshot(q, async snapshot => {
    const friendUids = snapshot.docs.flatMap(d => {
      const users = d.data().users as string[];
      return users.filter(u => u !== uid);
    });
    if (friendUids.length === 0) {
      callback([]);
      return;
    }
    const profiles = await Promise.all(friendUids.map(fuid => getUserProfile(fuid)));
    callback(profiles.filter(Boolean) as UserProfile[]);
  });
}

// Group functions
export async function createGroup(name: string, hostId: string): Promise<string> {
  const inviteCode = generateInviteCode();
  const docRef = await addDoc(collection(db, 'groups'), {
    name,
    inviteCode,
    hostId,
    memberIds: [hostId],
    createdAt: Date.now(),
  });
  return docRef.id;
}

export async function joinGroup(inviteCode: string, userId: string): Promise<Group | null> {
  const q = query(
    collection(db, 'groups'),
    where('inviteCode', '==', inviteCode.toUpperCase()),
    limit(1),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const groupDoc = snapshot.docs[0];
  await updateDoc(groupDoc.ref, {memberIds: arrayUnion(userId)});
  return {id: groupDoc.id, ...groupDoc.data()} as Group;
}

export async function leaveGroup(groupId: string, userId: string) {
  return updateDoc(doc(db, 'groups', groupId), {memberIds: arrayRemove(userId)});
}

export function onUserGroups(userId: string, callback: (groups: Group[]) => void) {
  const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', userId));
  return onSnapshot(q, snapshot => {
    callback(snapshot.docs.map(d => ({id: d.id, ...d.data()} as Group)));
  });
}

export async function getGroupMembers(memberIds: string[]): Promise<UserProfile[]> {
  if (memberIds.length === 0) return [];
  const profiles = await Promise.all(memberIds.map(uid => getUserProfile(uid)));
  return profiles.filter(Boolean) as UserProfile[];
}

// Leaderboard functions
export async function getLeaderboard(
  groupId: string,
  period: 'daily' | 'weekly' | 'monthly',
): Promise<{user: UserProfile; drinkCount: number}[]> {
  const groupSnap = await getDoc(doc(db, 'groups', groupId));
  if (!groupSnap.exists()) return [];
  const group = groupSnap.data() as Group;

  const now = new Date();
  let cutoff: Date;
  if (period === 'daily') {
    cutoff = new Date(now);
    cutoff.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - cutoff.getDay());
    cutoff.setHours(0, 0, 0, 0);
  } else {
    cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const results: {user: UserProfile; drinkCount: number}[] = [];

  for (const memberId of group.memberIds) {
    const q = query(
      collection(db, 'drinks'),
      where('userId', '==', memberId),
      where('timestamp', '>=', cutoff.getTime()),
    );
    const drinksSnap = await getDocs(q);
    const profile = await getUserProfile(memberId);
    if (profile) {
      results.push({user: profile, drinkCount: drinksSnap.size});
    }
  }

  return results.sort((a, b) => b.drinkCount - a.drinkCount);
}

// Safety alert
export async function sendSafetyAlert(userId: string, username: string, bac: number) {
  const q = query(collection(db, 'friends'), where('users', 'array-contains', userId));
  const friendsSnap = await getDocs(q);

  const friendUids = friendsSnap.docs.flatMap(d => {
    const users = d.data().users as string[];
    return users.filter(u => u !== userId);
  });

  return addDoc(collection(db, 'alerts'), {
    fromUid: userId,
    fromUsername: username,
    bac,
    recipientUids: friendUids,
    timestamp: Date.now(),
    type: 'safety',
  });
}
