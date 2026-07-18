import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, Firestore } from 'firebase/firestore';

// Get client-side config variables from Vite environment safely without TS compiler errors
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: metaEnv.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app;
let db: Firestore | null = null;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Validate connection to Firestore as mandated by Firebase integration guidelines
    const testConnection = async () => {
      try {
        if (db) {
          await getDocFromServer(doc(db, 'test', 'connection'));
          console.log('Firebase connection initialized successfully.');
        }
      } catch (error) {
        console.log('Firebase is unreachable or root path is protected. Falling back gracefully to LocalStorage mode.', error);
      }
    };
    testConnection();
  } catch (error) {
    console.error('Failed to initialize Firebase SDK:', error);
  }
} else {
  console.log('Firebase is not configured. Falling back to local/LocalStorage state storage.');
}

export { db, auth };

// Auth helpers
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<User | null> {
  if (!auth) {
    console.warn('Firebase Auth is not initialized. Sign-in is disabled.');
    return null;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return null;
  }
}

export async function logout(): Promise<void> {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

// Error handling wrapper according to Firebase integration guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
