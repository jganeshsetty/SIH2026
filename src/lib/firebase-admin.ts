import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig?.projectId || 'farmora-app';

const app = getApps().length === 0 
  ? initializeApp({ projectId })
  : getApp();

export const adminAuth = getAuth(app);
