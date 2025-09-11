
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { fromFirestore } from './firestore';

export interface PlatformSettings {
  enableTrustScoreAi: boolean;
  moderationTrustScoreThreshold: number;
  defaultStartingTrustScore: number;
}

const defaultSettings: PlatformSettings = {
    enableTrustScoreAi: true,
    moderationTrustScoreThreshold: 20,
    defaultStartingTrustScore: 50,
};

export const getPlatformSettings = async (): Promise<PlatformSettings> => {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured, returning default settings.');
    return defaultSettings;
  }
  const settingsRef = doc(db, 'config', 'platform_settings');
  const settingsSnap = await getDoc(settingsRef);

  if (settingsSnap.exists()) {
    return fromFirestore<PlatformSettings>(settingsSnap);
  } else {
    // If no settings exist, create them with default values
    await setDoc(settingsRef, { ...defaultSettings, lastUpdated: serverTimestamp() });
    return defaultSettings;
  }
};

export const updatePlatformSettings = async (
  newSettings: Partial<PlatformSettings>
): Promise<void> => {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured, settings not saved.');
    return;
  }
  const settingsRef = doc(db, 'config', 'platform_settings');
  await setDoc(settingsRef, { ...newSettings, lastUpdated: serverTimestamp() }, { merge: true });
};
