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
import { isSupabaseConfigured, supabase, mapSupabaseUser } from '../supabase';
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
  const [currentUser, setCurrentUser] = useState<any | null>(null);
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

  // Track if we are currently loading data from cloud so we don't overwrite during initial pull
  const loadingFromCloud = useRef(false);

  // 1. Auth Listener (Dual Mode)
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      setAuthLoading(true);
      // Fetch initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setCurrentUser(mapSupabaseUser(session?.user));
        setAuthLoading(false);
      }).catch((err) => {
        console.error('Error fetching Supabase session:', err);
        setAuthLoading(false);
      });

      // Listen to auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(mapSupabaseUser(session?.user));
        setAuthLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    } else {
      setAuthLoading(false);
    }
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

  // 3. Cloud Database Sync (Dual Mode: Supabase vs. Firebase)
  useEffect(() => {
    if (isSupabaseConfigured && supabase && currentUser) {
      setFirestoreLoading(true);
      loadingFromCloud.current = true;
      const uid = currentUser.uid;

      const fetchSupabaseData = async () => {
        try {
          // Check if stats exist
          const { data: statsData, error: statsError } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', uid)
            .single();

          if (statsError && statsError.code !== 'PGRST116') { // PGRST116: no rows returned
            console.error('Error fetching Supabase stats:', statsError);
          }

          if (!statsData) {
            console.log('Seeding data to Supabase...');
            
            // Seed Stats
            await supabase.from('user_stats').insert({
              user_id: uid,
              streak,
              water_amount: waterAmount
            });

            // Seed Settings
            await supabase.from('routine_settings').insert({
              user_id: uid,
              wake_time: settings.wakeTime,
              sleep_time: settings.sleepTime,
              weekly_exercise_goal: settings.weeklyExerciseGoal,
              monthly_language_goal: settings.monthlyLanguageGoal,
              push_notifications: settings.pushNotifications,
              dark_theme: settings.darkTheme
            });

            // Seed Habits
            if (habits.length > 0) {
              await supabase.from('habits').insert(
                habits.map(h => ({
                  id: h.id,
                  user_id: uid,
                  name: h.name,
                  completed: h.completed,
                  icon: h.icon
                }))
              );
            }

            // Seed Exercise Logs
            if (logs.length > 0) {
              await supabase.from('exercise_logs').insert(
                logs.map(l => ({
                  id: l.id,
                  user_id: uid,
                  type: l.type,
                  duration: l.duration,
                  intensity: l.intensity,
                  notes: l.notes || '',
                  date: l.date
                }))
              );
            }

            // Seed Language Logs
            if (languageLogs.length > 0) {
              await supabase.from('language_logs').insert(
                languageLogs.map(l => ({
                  id: l.id,
                  user_id: uid,
                  language: l.language,
                  hours: l.hours,
                  date: l.date,
                  skills: l.skills
                }))
              );
            }
            console.log('Supabase seeding completed successfully.');
          } else {
            console.log('Loading existing data from Supabase...');
            
            // Set Stats
            setStreak(statsData.streak ?? 12);
            setWaterAmount(statsData.water_amount ?? 1.2);

            // Fetch Settings
            const { data: settingsData } = await supabase
              .from('routine_settings')
              .select('*')
              .eq('user_id', uid)
              .single();
            if (settingsData) {
              setSettings({
                wakeTime: settingsData.wake_time ?? '06:30',
                sleepTime: settingsData.sleep_time ?? '22:30',
                weeklyExerciseGoal: settingsData.weekly_exercise_goal ?? 4,
                monthlyLanguageGoal: settingsData.monthly_language_goal ?? 20,
                pushNotifications: !!settingsData.push_notifications,
                darkTheme: !!settingsData.dark_theme
              });
            }

            // Fetch Habits
            const { data: habitsData } = await supabase
              .from('habits')
              .select('*')
              .eq('user_id', uid);
            if (habitsData) {
              setHabits(habitsData.map(h => ({
                id: h.id,
                name: h.name,
                completed: !!h.completed,
                icon: h.icon
              })));
            }

            // Fetch Exercise Logs
            const { data: logsData } = await supabase
              .from('exercise_logs')
              .select('*')
              .eq('user_id', uid)
              .order('date', { ascending: false });
            if (logsData) {
              setLogs(logsData.map(l => ({
                id: l.id,
                type: l.type,
                duration: l.duration,
                intensity: l.intensity,
                notes: l.notes,
                date: l.date
              })));
            }

            // Fetch Language Logs
            const { data: langLogsData } = await supabase
              .from('language_logs')
              .select('*')
              .eq('user_id', uid)
              .order('date', { ascending: false });
            if (langLogsData) {
              setLanguageLogs(langLogsData.map(l => ({
                id: l.id,
                language: l.language,
                hours: l.hours,
                date: l.date,
                skills: l.skills || []
              })));
            }
          }
        } catch (err) {
          console.error('Failed to sync Supabase data:', err);
        } finally {
          loadingFromCloud.current = false;
          setFirestoreLoading(false);
        }
      };

      fetchSupabaseData();
    } else if (isFirebaseConfigured && db && currentUser) {
      setFirestoreLoading(true);
      loadingFromCloud.current = true;

      const uid = currentUser.uid;

      // Define collection paths
      const habitsPath = `users/${uid}/habits`;
      const logsPath = `users/${uid}/exerciseLogs`;
      const langPath = `users/${uid}/languageLogs`;
      const statsPath = `users/${uid}/stats/global`;
      const settingsPath = `users/${uid}/settings/routine`;

      let isSeedingRequired = false;

      // Helpers to write to Firestore
      const seedFirebase = async () => {
        try {
          await setDoc(doc(db!, statsPath), {
            userId: uid,
            streak,
            waterAmount
          });

          await setDoc(doc(db!, settingsPath), settings);

          for (const habit of habits) {
            await setDoc(doc(db!, `${habitsPath}/${habit.id}`), habit);
          }

          for (const log of logs) {
            await setDoc(doc(db!, `${logsPath}/${log.id}`), log);
          }

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
              loadingFromCloud.current = false;
              setFirestoreLoading(false);
            });
          } else {
            loadingFromCloud.current = false;
            setFirestoreLoading(false);
          }
        })
        .catch((err) => {
          handleFirestoreError(err, OperationType.GET, statsPath);
          loadingFromCloud.current = false;
          setFirestoreLoading(false);
        });

      // Subscribe to Habits
      const unsubHabits = onSnapshot(collection(db, habitsPath), (snapshot) => {
        if (loadingFromCloud.current) return;
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
        if (loadingFromCloud.current) return;
        const loaded: ExerciseLog[] = [];
        snapshot.forEach((doc) => {
          loaded.push(doc.data() as ExerciseLog);
        });
        loaded.sort((a, b) => b.date.localeCompare(a.date));
        if (loaded.length > 0) {
          setLogs(loaded);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, logsPath);
      });

      // Subscribe to Language Logs
      const unsubLangLogs = onSnapshot(collection(db, langPath), (snapshot) => {
        if (loadingFromCloud.current) return;
        const loaded: LanguageLog[] = [];
        snapshot.forEach((doc) => {
          loaded.push(doc.data() as LanguageLog);
        });
        loaded.sort((a, b) => b.date.localeCompare(a.date));
        if (loaded.length > 0) {
          setLanguageLogs(loaded);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, langPath);
      });

      // Subscribe to Global Stats
      const unsubStats = onSnapshot(doc(db, statsPath), (docSnap) => {
        if (loadingFromCloud.current) return;
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
        if (loadingFromCloud.current) return;
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
    }
  }, [currentUser]);

  // 4. Mutation Wrappers (Dual Mode)
  const toggleHabit = async (id: string) => {
    const updatedHabits = habits.map((h) => 
      h.id === id ? { ...h, completed: !h.completed } : h
    );
    setHabits(updatedHabits);

    if (currentUser) {
      const updatedHabit = updatedHabits.find((h) => h.id === id);
      if (updatedHabit) {
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('habits').upsert({
              id,
              user_id: currentUser.uid,
              name: updatedHabit.name,
              completed: updatedHabit.completed,
              icon: updatedHabit.icon
            });
          } catch (e) {
            console.error('Error toggling habit in Supabase:', e);
          }
        } else if (isFirebaseConfigured && db) {
          const habitPath = `users/${currentUser.uid}/habits/${id}`;
          try {
            await setDoc(doc(db, `users/${currentUser.uid}/habits`, id), updatedHabit);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, habitPath);
          }
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

    if (currentUser) {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('habits').insert({
            id: newHabit.id,
            user_id: currentUser.uid,
            name: newHabit.name,
            completed: newHabit.completed,
            icon: newHabit.icon
          });
        } catch (e) {
          console.error('Error adding habit to Supabase:', e);
        }
      } else if (isFirebaseConfigured && db) {
        const habitPath = `users/${currentUser.uid}/habits/${newHabit.id}`;
        try {
          await setDoc(doc(db, `users/${currentUser.uid}/habits`, newHabit.id), newHabit);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, habitPath);
        }
      }
    }
  };

  const deleteHabit = async (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));

    if (currentUser) {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('habits').delete().eq('id', id).eq('user_id', currentUser.uid);
        } catch (e) {
          console.error('Error deleting habit from Supabase:', e);
        }
      } else if (isFirebaseConfigured && db) {
        const habitPath = `users/${currentUser.uid}/habits/${id}`;
        try {
          await deleteDoc(doc(db, `users/${currentUser.uid}/habits`, id));
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, habitPath);
        }
      }
    }
  };

  const addExerciseLog = async (newLog: Omit<ExerciseLog, 'id' | 'date'>) => {
    const logItem: ExerciseLog = {
      ...newLog,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    
    setLogs((prev) => [logItem, ...prev]);
    const nextStreak = streak + 1;
    setStreak(nextStreak);

    if (currentUser) {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('exercise_logs').insert({
            id: logItem.id,
            user_id: currentUser.uid,
            type: logItem.type,
            duration: logItem.duration,
            intensity: logItem.intensity,
            notes: logItem.notes || '',
            date: logItem.date
          });
          
          await supabase.from('user_stats').upsert({
            user_id: currentUser.uid,
            streak: nextStreak,
            water_amount: waterAmount
          });
        } catch (e) {
          console.error('Error adding exercise log to Supabase:', e);
        }
      } else if (isFirebaseConfigured && db) {
        const logPath = `users/${currentUser.uid}/exerciseLogs/${logItem.id}`;
        try {
          await setDoc(doc(db, `users/${currentUser.uid}/exerciseLogs`, logItem.id), logItem);
          const statsPath = `users/${currentUser.uid}/stats/global`;
          await setDoc(doc(db, statsPath), {
            userId: currentUser.uid,
            streak: nextStreak,
            waterAmount
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, logPath);
        }
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

    if (currentUser) {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('language_logs').insert({
            id: newLog.id,
            user_id: currentUser.uid,
            language: newLog.language,
            hours: newLog.hours,
            date: newLog.date,
            skills: newLog.skills
          });
        } catch (e) {
          console.error('Error adding language log to Supabase:', e);
        }
      } else if (isFirebaseConfigured && db) {
        const logPath = `users/${currentUser.uid}/languageLogs/${newLog.id}`;
        try {
          await setDoc(doc(db, `users/${currentUser.uid}/languageLogs`, newLog.id), newLog);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, logPath);
        }
      }
    }
  };

  const addWater = async (amount: number) => {
    const nextAmount = Math.round((waterAmount + amount) * 100) / 100;
    setWaterAmount(nextAmount);

    if (currentUser) {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('user_stats').upsert({
            user_id: currentUser.uid,
            streak,
            water_amount: nextAmount
          });
        } catch (e) {
          console.error('Error updating water in Supabase:', e);
        }
      } else if (isFirebaseConfigured && db) {
        const statsPath = `users/${currentUser.uid}/stats/global`;
        try {
          await setDoc(doc(db, statsPath), {
            userId: currentUser.uid,
            streak,
            waterAmount: nextAmount
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, statsPath);
        }
      }
    }
  };

  const saveSettings = async (newSettings: RoutineSettings) => {
    setSettings(newSettings);

    if (currentUser) {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('routine_settings').upsert({
            user_id: currentUser.uid,
            wake_time: newSettings.wakeTime,
            sleep_time: newSettings.sleepTime,
            weekly_exercise_goal: newSettings.weeklyExerciseGoal,
            monthly_language_goal: newSettings.monthlyLanguageGoal,
            push_notifications: newSettings.pushNotifications,
            dark_theme: newSettings.darkTheme
          });
        } catch (e) {
          console.error('Error saving settings to Supabase:', e);
        }
      } else if (isFirebaseConfigured && db) {
        const settingsPath = `users/${currentUser.uid}/settings/routine`;
        try {
          await setDoc(doc(db, settingsPath), newSettings);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, settingsPath);
        }
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
