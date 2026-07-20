import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, set } from 'firebase/database'
import { db, rtdb } from './firebase'
import type { UserProfile } from '@/types/user'

// Username availability check
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const q = query(
    collection(db, 'usernames'),
    where('username', '==', username.toLowerCase())
  )
  const snapshot = await getDocs(q)
  return snapshot.empty
}

// Create user profile after signup
export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, 'uid' | 'profilePhotoUrl' | 'bio' | 'followers' | 'following' | 'postsCount' | 'createdAt' | 'isOnline'>
): Promise<void> {
  const profile: UserProfile = {
    uid,
    fullName: data.fullName,
    email: data.email,
    username: data.username.toLowerCase(),
    location: data.location,
    dateOfBirth: data.dateOfBirth,
    profilePhotoUrl: '',
    bio: '',
    followers: 0,
    following: 0,
    postsCount: 0,
    createdAt: Date.now(),
    isOnline: true,
  }

  // Firestore: users collection
  await setDoc(doc(db, 'users', uid), {
    ...profile,
    createdAt: serverTimestamp(),
  })

  // Firestore: username → uid mapping (for uniqueness)
  await setDoc(doc(db, 'usernames', data.username.toLowerCase()), {
    uid,
    username: data.username.toLowerCase(),
  })

  // Realtime DB: online presence
  await set(ref(rtdb, `presence/${uid}`), {
    isOnline: true,
    lastSeen: Date.now(),
  })
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}
