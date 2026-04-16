export interface UserProfile {
  uid: string;
  username: string;
  realName: string;
  email: string;
  age: number;
  weight: number; // lbs
  gender: 'Male' | 'Female' | 'Other';
  photoURL?: string;
  createdAt: number;
}

export interface DrinkLog {
  id: string;
  userId: string;
  type: string;
  customName?: string;
  oz: number;
  abv: number; // decimal, e.g. 0.05
  standardDrinks: number;
  calories: number;
  timestamp: number;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  hostId: string;
  memberIds: string[];
  createdAt: number;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  fromUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}
