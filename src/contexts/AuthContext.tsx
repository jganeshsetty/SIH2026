import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { User as AppUser } from '../types.ts';

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  signInWithGoogle: (role: 'farmer' | 'buyer' | 'transporter') => Promise<void>;
  setRole: (role: 'farmer' | 'buyer' | 'transporter') => void;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>({
    id: 1,
    uid: 'demo-user-123',
    email: 'user@farmora.io',
    name: 'Demo Farmora User',
    role: 'farmer'
  });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>('demo-token-123');

  const setRole = (role: 'farmer' | 'buyer' | 'transporter') => {
    setAppUser(prev => prev ? { ...prev, role } : {
      id: 1,
      uid: 'demo-user-123',
      email: 'user@farmora.io',
      name: `Farmora ${role.toUpperCase()}`,
      role
    });
  };

  const signInWithGoogle = async (role: 'farmer' | 'buyer' | 'transporter') => {
    try {
      if (auth) {
        const result = await signInWithPopup(auth, googleAuthProvider);
        const idToken = await result.user.getIdToken();
        setToken(idToken);
        setAppUser({
          id: 1,
          uid: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || 'Farmora User',
          role
        });
      } else {
        setRole(role);
      }
    } catch (error: any) {
      console.warn('Sign-in fallback active for prototype demo.');
      setRole(role);
    }
  };

  const logout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, appUser, loading, signInWithGoogle, setRole, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
