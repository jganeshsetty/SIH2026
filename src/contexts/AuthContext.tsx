import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { User as AppUser } from '../types.ts';

export type UserRole = 'farmer' | 'buyer' | 'transporter' | 'FARMER' | 'BUYER' | 'TRANSPORT_DRIVER';

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  token: string | null;
  registerWithEmail: (data: { email: string; password: string; name: string; role: UserRole; phone?: string; address?: string }) => Promise<AppUser>;
  loginWithEmail: (data: { email: string; password: string }) => Promise<AppUser>;
  signInWithGoogle: (role: UserRole) => Promise<AppUser | null>;
  setRole: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('farmora_token'));

  // Fetch user profile from PostgreSQL using token
  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const profile: AppUser = await res.json();
        setAppUser(profile);
        return profile;
      } else {
        // Token expired or invalid
        localStorage.removeItem('farmora_token');
        setToken(null);
        setAppUser(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
    return null;
  };

  const syncUserWithBackend = async (idToken: string, role?: UserRole, name?: string) => {
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
    const initAuth = async () => {
      const storedToken = localStorage.getItem('farmora_token');
      if (storedToken) {
        setToken(storedToken);
        await fetchUserProfile(storedToken);
      }

      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setUser(firebaseUser);
          if (firebaseUser && !localStorage.getItem('farmora_token')) {
            try {
              const idToken = await firebaseUser.getIdToken();
              setToken(idToken);
              localStorage.setItem('farmora_token', idToken);
              const storedRole = (localStorage.getItem('farmora_pending_role') || 'buyer') as UserRole;
              await syncUserWithBackend(idToken, storedRole, firebaseUser.displayName || 'Farmora User');
            } catch (e) {
              console.error('Error fetching Firebase ID token:', e);
            }
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const registerWithEmail = async (data: { email: string; password: string; name: string; role: UserRole; phone?: string; address?: string }): Promise<AppUser> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to register');
      }

      localStorage.setItem('farmora_token', resData.token);
      setToken(resData.token);
      setAppUser(resData.user);
      setLoading(false);
      return resData.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithEmail = async (data: { email: string; password: string }): Promise<AppUser> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to log in');
      }

      localStorage.setItem('farmora_token', resData.token);
      setToken(resData.token);
      setAppUser(resData.user);
      setLoading(false);
      return resData.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async (role: UserRole) => {
    setLoading(true);
    try {
      localStorage.setItem('farmora_pending_role', role);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('farmora_token', idToken);
      const syncedUser = await syncUserWithBackend(idToken, role, result.user.displayName || 'Farmora User');
      setLoading(false);
      return syncedUser;
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      setLoading(false);
      throw error;
    }
  };

  const setRole = (role: UserRole) => {
    if (appUser && token) {
      syncUserWithBackend(token, role, appUser.name);
    } else {
      setAppUser(prev => prev ? { ...prev, role: role as any } : {
        id: 1,
        uid: 'user-123',
        email: 'user@farmora.io',
        name: `Farmora User`,
        role: role as any
      });
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (auth) await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setUser(null);
    setAppUser(null);
    setToken(null);
    localStorage.removeItem('farmora_token');
    localStorage.removeItem('farmora_pending_role');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      appUser,
      loading,
      token,
      registerWithEmail,
      loginWithEmail,
      signInWithGoogle,
      setRole,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
