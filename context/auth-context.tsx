import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

import { auth, db } from '@/lib/firebase';

const USER_STORAGE_KEY = 'village_app_user';

export type VehicleType = 'car' | 'bike' | 'tempo' | 'other';

export interface VehicleDetails {
  type: VehicleType;
  number: string;
  model: string;
  imageUrl?: string;
  routes?: string[];
  villages?: string[];
}

export interface ShopDetails {
  name: string;
  category: string;
  imageUrl?: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  phone: string;
  villageName: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
  villageLat?: number;
  villageLng?: number;
  isProvider?: boolean;
  providerType?: 'transport' | 'shop';
  providerStatus?: 'active' | 'inactive';
  vehicle?: VehicleDetails;
  shop?: ShopDetails;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (phone: string, mpin: string) => Promise<void>;
  register: (profile: Omit<UserProfile, 'uid'>, mpin: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // SecureStore is the source of truth for auth state across app restarts.
  useEffect(() => {
    const restore = async () => {
      try {
        const cached = await SecureStore.getItemAsync(USER_STORAGE_KEY);
        if (cached) {
          setUser(JSON.parse(cached));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (phone: string, mpin: string) => {
    const email = `${phone.replace(/\D/g, '')}@village-app.com`;
    const credential = await signInWithEmailAndPassword(auth, email, `00${mpin}`);
    const docSnap = await getDoc(doc(db, 'users', credential.user.uid));

    if (!docSnap.exists()) {
      await deleteUser(credential.user).catch(() => {});
      throw new Error('profile/not-found');
    }

    const profile = docSnap.data() as UserProfile;
    await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  }, []);

  const register = useCallback(async (profile: Omit<UserProfile, 'uid'>, mpin: string) => {
    const email = `${profile.phone.replace(/\D/g, '')}@village-app.com`;
    const credential = await createUserWithEmailAndPassword(auth, email, `00${mpin}`);
    const fullProfile: UserProfile = { uid: credential.user.uid, ...profile };

    try {
      console.log('[register] Firebase Auth user created:', credential.user.uid);
      console.log('[register] Writing to Firestore...');
      const firestoreData = Object.fromEntries(
        Object.entries({ ...fullProfile, createdAt: serverTimestamp() }).filter(
          ([, v]) => v !== undefined,
        ),
      );
      await setDoc(doc(db, 'users', credential.user.uid), firestoreData);
      console.log('[register] Firestore write successful');
    } catch (firestoreError: any) {
      console.error('[register] Firestore write failed — code:', firestoreError.code);
      console.error('[register] Firestore write failed — message:', firestoreError.message);
      await deleteUser(credential.user).catch((deleteErr) => {
        console.error('[register] Could not delete orphaned auth user:', deleteErr.code, deleteErr.message);
      });
      throw firestoreError;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );
    await updateDoc(doc(db, 'users', user.uid), cleanUpdates);
    const updated: UserProfile = { ...user, ...cleanUpdates } as UserProfile;
    setUser(updated);
    await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(updated));
  }, [user]);

  const logout = useCallback(async () => {
    await signOut(auth).catch(() => {});
    setUser(null);
    await SecureStore.deleteItemAsync(USER_STORAGE_KEY).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
