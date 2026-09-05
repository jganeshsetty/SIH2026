import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { User as AppUser } from '../types.ts';

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  signInWithGoogle: (role: 'farmer' | 'buyer' | 'transporter') => Promise<AppUser | null>;
  setRole: (role: 'farmer' | 'buyer' | 'transporter') => void;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const syncUserWithBackend = async (idToken: string, role?: 'farmer' | 'buyer' | 'transporter', name?: string) => {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ role, name })
      });
      if (res.ok) {
        const syncedUser: AppUser = await res.json();
        setAppUser(syncedUser);
        return syncedUser;
      }
    } catch (err) {
      console.error('Failed to sync user with backend:', err);
    }
    return null;
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          const storedRole = (localStorage.getItem('farmora_pending_role') || 'buyer') as 'farmer' | 'buyer' | 'transporter';
          await syncUserWithBackend(idToken, storedRole, firebaseUser.displayName || 'Farmora User');
        } catch (e) {
          console.error('Error fetching ID token:', e);
        }
      } else {
        setToken(null);
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (role: 'farmer' | 'buyer' | 'transporter') => {
    setLoading(true);
    try {
      localStorage.setItem('farmora_pending_role', role);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      const syncedUser = await syncUserWithBackend(idToken, role, result.user.displayName || 'Farmora User');
      setLoading(false);
      return syncedUser;
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      setLoading(false);
      throw error;
    }
  };

  const setRole = (role: 'farmer' | 'buyer' | 'transporter') => {
    if (appUser && token) {
      syncUserWithBackend(token, role, appUser.name);
    } else {
      setAppUser(prev => prev ? { ...prev, role } : {
        id: 1,
        uid: 'demo-user-123',
        email: 'user@farmora.io',
        name: `Farmora ${role.toUpperCase()}`,
        role
      });
    }
  };

  const logout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setUser(null);
    setAppUser(null);
    setToken(null);
    localStorage.removeItem('farmora_pending_role');
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, signInWithGoogle, setRole, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

