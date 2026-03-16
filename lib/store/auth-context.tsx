'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { AuthSession, User } from '@/types';

interface AuthContextType {
  activeSession: AuthSession | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SINGLE_SESSION_KEY = 'auth_session';
const LEGACY_SESSIONS_KEY = 'auth_sessions';
const LEGACY_ACTIVE_KEY = 'active_session_email';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<AuthSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toSessionUser = (rawUser: User): User => {
    const roles = rawUser.roles ?? ['BUYER', 'SELLER'];
    return {
      ...rawUser,
      roles,
      profile: {
        ...rawUser.profile,
        id: rawUser.profile?.id ?? `profile-${rawUser.id}`,
        accountId: rawUser.profile?.accountId ?? rawUser.id,
        displayName: rawUser.profile?.displayName ?? rawUser.email,
        avatarUrl: rawUser.profile?.avatarUrl ?? null,
        bio: rawUser.profile?.bio ?? null,
        phoneNumber: rawUser.profile?.phoneNumber ?? null,
        location: rawUser.profile?.location ?? null,
        createdAt: rawUser.profile?.createdAt ?? new Date().toISOString(),
        updatedAt: rawUser.profile?.updatedAt ?? new Date().toISOString(),
      },
    };
  };

  // Initial load
  useEffect(() => {
    const savedSession = localStorage.getItem(SINGLE_SESSION_KEY);
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession) as AuthSession;
        setActiveSession({
          ...parsedSession,
          user: toSessionUser(parsedSession.user),
        });
        setIsInitialized(true);
        return;
      } catch (error) {
        console.error('Failed to parse auth session', error);
        localStorage.removeItem(SINGLE_SESSION_KEY);
      }
    }

    const savedSessions = localStorage.getItem(LEGACY_SESSIONS_KEY);
    const savedActive = localStorage.getItem(LEGACY_ACTIVE_KEY);

    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions) as AuthSession[];
        const normalizedSessions = parsedSessions.map((session) => ({
          ...session,
          user: toSessionUser(session.user),
        }));
        const migratedSession =
          (savedActive &&
            normalizedSessions.find((session) => session.user.email === savedActive)) ??
          normalizedSessions.at(-1) ??
          null;

        if (migratedSession) {
          setActiveSession(migratedSession);
          localStorage.setItem(SINGLE_SESSION_KEY, JSON.stringify(migratedSession));
        }
      } catch (error) {
        console.error('Failed to parse legacy auth sessions', error);
      }
    }

    localStorage.removeItem(LEGACY_SESSIONS_KEY);
    localStorage.removeItem(LEGACY_ACTIVE_KEY);
    setIsInitialized(true);
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (activeSession) {
      localStorage.setItem(SINGLE_SESSION_KEY, JSON.stringify(activeSession));
    } else {
      localStorage.removeItem(SINGLE_SESSION_KEY);
    }

    localStorage.removeItem(LEGACY_SESSIONS_KEY);
    localStorage.removeItem(LEGACY_ACTIVE_KEY);
  }, [activeSession, isInitialized]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const newSession: AuthSession = {
          user: toSessionUser(data.user),
          token: data.token,
        };
        setActiveSession(newSession);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const newSession: AuthSession = {
          user: toSessionUser(data.user),
          token: data.token,
        };
        setActiveSession(newSession);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setActiveSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        activeSession,
        login,
        signup,
        logout,
        isLoading,
        isReady: isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
