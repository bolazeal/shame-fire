import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { fromFirestore } from './firestore';
import type { PlatformSettings } from './types';


const defaultSettings: PlatformSettings = {
    platformName: 'Shame',
    platformDescription: 'A platform for transparent feedback and accountability.',
    maintenanceMode: false,
    maintenanceMessage: 'The platform is currently under maintenance. Please check back later.',
    allowRegistration: true,
    requireEmailVerification: true,
    defaultTrustScore: 50,
    minimumTrustScore: 0,
    maximumTrustScore: 100,
    maxPostLength: 2000,
    allowAnonymousPosts: true,
    moderateNewUserContent: true,
    autoFlagThreshold: 5,
    enableAiModeration: true,
    aiModerationSensitivity: 'medium',
    flaggedContentRetentionDays: 30,
    featureShameTv: true,
    featureVillageSquare: true,
    featureHallOfHonour: true,
    featureDirectMessages: true,
};

export const getPlatformSettings = async (): Promise<PlatformSettings> => {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured, returning default settings.');
    return defaultSettings;
  }
  const settingsRef = doc(db, 'config', 'platform_settings');
  const settingsSnap = await getDoc(settingsRef);

  if (settingsSnap.exists()) {
    // Merge fetched settings with defaults to ensure all keys are present
    const fetchedSettings = fromFirestore<Partial<PlatformSettings>>(settingsSnap);
    return { ...defaultSettings, ...fetchedSettings };
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

    