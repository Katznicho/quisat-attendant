import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as SecureStore from 'expo-secure-store';

import { api, ApiError, onUnauthorized, tokenStore } from '../api/client';
import type { Attendant } from '../api/types';

type AuthState = {
  attendant: Attendant | null;
  loading: boolean;
  signIn: (token: string, attendant: Attendant) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const PROFILE_KEY = 'quisat_attendant_profile';

async function saveProfile(attendant: Attendant) {
  await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(attendant));
}

async function cachedProfile(): Promise<Attendant | null> {
  try {
    const raw = await SecureStore.getItemAsync(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Attendant) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [attendant, setAttendant] = useState<Attendant | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(async () => {
    await tokenStore.clear();
    await SecureStore.deleteItemAsync(PROFILE_KEY);
    setAttendant(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Token may already be invalid; clear locally either way.
    }
    await clearSession();
  }, [clearSession]);

  const signIn = useCallback(async (token: string, next: Attendant) => {
    await tokenStore.set(token);
    await saveProfile(next);
    setAttendant(next);
  }, []);

  const refresh = useCallback(async () => {
    const response = await api.me();
    await saveProfile(response.data.attendant);
    setAttendant(response.data.attendant);
  }, []);

  useEffect(() => {
    onUnauthorized(() => {
      clearSession();
    });

    (async () => {
      try {
        if (await tokenStore.get()) {
          await refresh();
        }
      } catch (error) {
        // Offline at launch: keep the session and show the cached profile.
        if (error instanceof ApiError && error.status === 0) {
          setAttendant(await cachedProfile());
        } else {
          await clearSession();
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => onUnauthorized(null);
  }, [clearSession, refresh]);

  const value = useMemo(
    () => ({ attendant, loading, signIn, signOut, refresh }),
    [attendant, loading, signIn, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
