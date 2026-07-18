import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  db, 
  auth, 
  isFirebaseConfigured, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { Habit, ExerciseLog, LanguageLog, RoutineSettings } from '../types';

const defaultHabits: Habit[] = [
  { id: '1', name: 'Beber água', completed: true, icon: 'Droplet' },
  { id: '2', name: 'Exercício', completed: true, icon: 'Dumbbell' },
  { id: '3', name: 'Inglês', completed: true, icon: 'Languages' },
  { id: '4', name: 'Francês', completed: true, icon: 'BookOpen' },
  { id: '5', name: 'Preparar almoço', completed: true, icon: 'Utensils' },
  { id: '6', name: 'Dormir antes das 22h', completed: false, icon: 'Bed' },
];

const defaultLogs: ExerciseLog[] = [
  { id: '1', type: 'Musculação', duration: 45, intensity: 'Moderada', date: '2026-07-17', notes: 'Treino de pernas focado em força.' },
  { id: '2', type: 'Corrida', duration: 30, intensity: 'Intensa', date: '2026-07-15', notes: 'Corrida moderada na esteira.' }
];

const defaultLanguageLogs: LanguageLog[] = [
  { id: '1', language: 'en', hours: 1.5, date: '2026-07-17', skills: ['listening', 'speaking'] },
  { id: '2', language: 'fr', hours: 2.0, date: '2026-07-16', skills: ['reading', 'vocabulary'] },
  { id: '3', language: 'en', hours: 1.0, date: '2026-07-15', skills: ['grammar', 'writing'] },
  { id: '4', language: 'fr', hours: 1.8, date: '2026-07-13', skills: ['listening', 'conversation'] },
];

const defaultSettings: RoutineSettings = {
  wakeTime: '06:30',
  sleepTime: '22:30',
  weeklyExerciseGoal: 4,
  monthlyLanguageGoal: 20,
  pushNotifications: true,
  darkTheme: false
};

export function useFirebaseSync() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [firestoreLoading, setFirestoreLoading] = useState(false);

  // Core application states
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('north_streak');
    return saved ? parseInt(saved, 10) : 12;
  });
  const [waterAmount, setWaterAmount] = useState(() => {
    const saved = localStorage.getItem('north_waterAmount');
    return saved ? parseFloat(saved) : 1.2;
  });
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('north_habits');
    return saved ? JSON.parse(saved) : defaultHabits;
  });
  const [logs, setLogs] = useState<ExerciseLog[]>(() => {
    const saved = localStorage.getItem('north_logs');
    return saved ? JSON.parse(saved) : defaultLogs;
  });
  const [languageLogs, setLanguageLogs] = useState<LanguageLog[]>(() => {
    const saved = localStorage.getItem('north_languageLogs');
    return saved ? JSON.parse(saved) : defaultLanguageLogs;
  });
  const [settings, setSettings] = useState<RoutineSettings>(() => {
    const saved = localStorage.getItem('north_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Track if we are currently loading data from Firebase so we don't overwrite during initial pull
  const loadingFromFirebase = useRef(false);

  // 1. Auth Listener
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. LocalStorage backup writer (for local mode or as offline protection)
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('north_streak', streak.toString());
      localStorage.setItem('north_waterAmount', waterAmount.toString());
      localStorage.setItem('north_habits', JSON.stringify(habits));
      localStorage.setItem('north_logs', JSON.stringify(logs));
      localStorage.setItem('north_languageLogs', JSON.stringify(languageLogs));
      localStorage.setItem('north_settings', JSON.stringify(settings));
    }
  }, [streak, waterAmount, habits, logs, languageLogs, settings, currentUser]);

  // 3. Real-time Firebase Sync
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !currentUser) {
      return;
    }

    setFirestoreLoading(true);
    loadingFromFirebase.current = true;

    const uid = currentUser.uid;

    // Define collection paths
    const habitsPath = `users/${uid}/habits`;
    const logsPath = `users/${uid}/exerciseLogs`;
    const langPath = `users/${uid}/languageLogs`;
    const statsPath = `users/${uid}/stats/global`;
    const settingsPath = `users/${uid}/settings/routine`;

    // A flag to check if we need to seed because the user is completely new
    let isSeedingRequired = false;

    // Helpers to write to Firestore
    const seedFirebase = async () => {
      try {
        // Seed Stats
        await setDoc(doc(db!, statsPath), {
          userId: uid,
          streak,
          waterAmount
        });

        // Seed Settings
        await setDoc(doc(db!, settingsPath), settings);

        // Seed Habits
        for (const habit of habits) {
          await setDoc(doc(db!, `${habitsPath}/${habit.id}`), habit);
        }

        // Seed Exercise Logs
        for (const log of logs) {
          await setDoc(doc(db!, `${logsPath}/${log.id}`), log);
        }

        // Seed Language Logs
        for (const log of languageLogs) {
          await setDoc(doc(db!, `${langPath}/${log.id}`), log);
        }

        console.log('Successfully synced local data to Firebase cloud profile.');
      } catch (err) {
        console.error('Error seeding data to Firestore:', err);
      }
    };

    // First, check if global stats exist to determine if seeding is required
    getDoc(doc(db, statsPath))
      .then((docSnap) => {
        if (!docSnap.exists()) {
          isSeedingRequired = true;
          seedFirebase().then(() => {
            loadingFromFirebase.current = false;
            setFirestoreLoading(false);
          });
        } else {
          loadingFromFirebase.current = false;
          setFirestoreLoading(false);
        }
      })
      .catch((err) => {
        handleFirestoreError(err, OperationType.GET, statsPath);
        loadingFromFirebase.current = false;
        setFirestoreLoading(false);
      });

    // Subscribe to Habits
    const unsubHabits = onSnapshot(collection(db, habitsPath), (snapshot) => {
      if (loadingFromFirebase.current) return;
      const loaded: Habit[] = [];
      snapshot.forEach((doc) => {
        loaded.push(doc.data() as Habit);
      });
      if (loaded.length > 0) {
        setHabits(loaded);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, habitsPath);
    });

    // Subscribe to Exercise Logs
    const unsubLogs = onSnapshot(collection(db, logsPath), (snapshot) => {
      if (loadingFromFirebase.current) return;
      const loaded: ExerciseLog[] = [];
      snapshot.forEach((doc) => {
        loaded.push(doc.data() as ExerciseLog);
      });
      // Sort descending by date
      loaded.sort((a, b) => b.date.localeCompare(a.date));
      if (loaded.length > 0) {
        setLogs(loaded);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, logsPath);
    });

    // Subscribe to Language Logs
    const unsubLangLogs = onSnapshot(collection(db, langPath), (snapshot) => {
      if (loadingFromFirebase.current) return;
      const loaded: LanguageLog[] = [];
      snapshot.forEach((doc) => {
        loaded.push(doc.data() as LanguageLog);
      });
      // Sort descending by date
      loaded.sort((a, b) => b.date.localeCompare(a.date));
      if (loaded.length > 0) {
        setLanguageLogs(loaded);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, langPath);
    });

    // Subscribe to Global Stats
    const unsubStats = onSnapshot(doc(db, statsPath), (docSnap) => {
      if (loadingFromFirebase.current) return;
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.streak !== undefined) setStreak(data.streak);
        if (data.waterAmount !== undefined) setWaterAmount(data.waterAmount);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, statsPath);
    });

    // Subscribe to Routine Settings
    const unsubSettings = onSnapshot(doc(db, settingsPath), (docSnap) => {
      if (loadingFromFirebase.current) return;
      if (docSnap.exists()) {
        setSettings(docSnap.data() as RoutineSettings);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, settingsPath);
    });

    return () => {
      unsubHabits();
      unsubLogs();
      unsubLangLogs();
      unsubStats();
      unsubSettings();
    };
  }, [currentUser]);

  // 4. Mutation Wrappers
  const toggleHabit = async (id: string) => {
    // Optimistic / Local update
    const updatedHabits = habits.map((h) => 
      h.id === id ? { ...h, completed: !h.completed } : h
    );
    setHabits(updatedHabits);

    if (currentUser && db) {
      const habitPath = `users/${currentUser.uid}/habits/${id}`;
      const updatedHabit = updatedHabits.find((h) => h.id === id);
      if (updatedHabit) {
        try {
          await setDoc(doc(db, `users/${currentUser.uid}/habits`, id), updatedHabit);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, habitPath);
        }
      }
    }
  };

  const addHabit = async (name: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      completed: false,
      icon: 'CheckCircle2'
    };
    setHabits((prev) => [...prev, newHabit]);

    if (currentUser && db) {
      const habitPath = `users/${currentUser.uid}/habits/${newHabit.id}`;
      try {
        await setDoc(doc(db, `users/${currentUser.uid}/habits`, newHabit.id), newHabit);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, habitPath);
      }
    }
  };

  const deleteHabit = async (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));

    if (currentUser && db) {
      const habitPath = `users/${currentUser.uid}/habits/${id}`;
      try {
        await deleteDoc(doc(db, `users/${currentUser.uid}/habits`, id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, habitPath);
      }
    }
  };

  const addExerciseLog = async (newLog: Omit<ExerciseLog, 'id' | 'date'>) => {
    const logItem: ExerciseLog = {
      ...newLog,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    
    // Sort descending local state
    setLogs((prev) => [logItem, ...prev]);
    setStreak((prev) => {
      const nextStreak = prev + 1;
      if (currentUser && db) {
        const statsPath = `users/${currentUser.uid}/stats/global`;
        setDoc(doc(db, statsPath), {
          userId: currentUser.uid,
          streak: nextStreak,
          waterAmount
        }).catch((e) => handleFirestoreError(e, OperationType.WRITE, statsPath));
      }
      return nextStreak;
    });

    if (currentUser && db) {
      const logPath = `users/${currentUser.uid}/exerciseLogs/${logItem.id}`;
      try {
        await setDoc(doc(db, `users/${currentUser.uid}/exerciseLogs`, logItem.id), logItem);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, logPath);
      }
    }
  };

  const addLanguageHours = async (hours: number, language: 'en' | 'fr', skills?: string[]) => {
    const newLog: LanguageLog = {
      id: Date.now().toString(),
      language,
      hours,
      date: new Date().toISOString().split('T')[0],
      skills: skills || ['listening', 'speaking']
    };
    
    setLanguageLogs((prev) => [newLog, ...prev]);

    if (currentUser && db) {
      const logPath = `users/${currentUser.uid}/languageLogs/${newLog.id}`;
      try {
        await setDoc(doc(db, `users/${currentUser.uid}/languageLogs`, newLog.id), newLog);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, logPath);
      }
    }
  };

  const addWater = async (amount: number) => {
    setWaterAmount((prev) => {
      const nextAmount = Math.round((prev + amount) * 100) / 100;
      if (currentUser && db) {
        const statsPath = `users/${currentUser.uid}/stats/global`;
        setDoc(doc(db, statsPath), {
          userId: currentUser.uid,
          streak,
          waterAmount: nextAmount
        }).catch((e) => handleFirestoreError(e, OperationType.WRITE, statsPath));
      }
      return nextAmount;
    });
  };

  const saveSettings = async (newSettings: RoutineSettings) => {
    setSettings(newSettings);

    if (currentUser && db) {
      const settingsPath = `users/${currentUser.uid}/settings/routine`;
      try {
        await setDoc(doc(db, settingsPath), newSettings);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, settingsPath);
      }
    }
  };

  return {
    currentUser,
    authLoading,
    firestoreLoading,
    streak,
    waterAmount,
    habits,
    logs,
    languageLogs,
    settings,
    toggleHabit,
    addHabit,
    deleteHabit,
    addExerciseLog,
    addLanguageHours,
    addWater,
    saveSettings,
  };
}
