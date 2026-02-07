'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { AuthSession } from '@/types';

interface AuthContextType {
    sessions: AuthSession[];
    activeSession: AuthSession | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (name: string, email: string, password: string, roles: string[]) => Promise<boolean>;
    logout: (email: string) => void;
    switchAccount: (email: string) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [sessions, setSessions] = useState<AuthSession[]>([]);
    const [activeSession, setActiveSession] = useState<AuthSession | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initial load
    useEffect(() => {
        const savedSessions = localStorage.getItem('auth_sessions');
        const savedActive = localStorage.getItem('active_session_email');

        if (savedSessions) {
            try {
                const parsedSessions: AuthSession[] = JSON.parse(savedSessions);
                setSessions(parsedSessions);

                if (savedActive) {
                    const active = parsedSessions.find(s => s.user.email === savedActive);
                    if (active) setActiveSession(active);
                }
            } catch (e) {
                console.error('Failed to parse auth sessions', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Sync to local storage
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('auth_sessions', JSON.stringify(sessions));
            if (activeSession) {
                localStorage.setItem('active_session_email', activeSession.user.email);
            } else {
                localStorage.removeItem('active_session_email');
            }
        }
    }, [sessions, activeSession, isInitialized]);

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
                    user: data.user,
                    token: data.token,
                };

                setSessions(prev => {
                    const filtered = prev.filter(s => s.user.email !== email);
                    return [...filtered, newSession];
                });
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

    const signup = async (name: string, email: string, password: string, roles: string[]) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, roles }),
            });

            const data = await response.json();

            if (data.success) {
                const newSession: AuthSession = {
                    user: data.user,
                    token: data.token,
                };

                setSessions(prev => {
                    const filtered = prev.filter(s => s.user.email !== email);
                    return [...filtered, newSession];
                });
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

    const logout = (email: string) => {
        setSessions(prev => {
            const newSessions = prev.filter(s => s.user.email !== email);
            if (activeSession?.user.email === email) {
                setActiveSession(newSessions.length > 0 ? newSessions[0] : null);
            }
            return newSessions;
        });
    };

    const switchAccount = (email: string) => {
        const target = sessions.find(s => s.user.email === email);
        if (target) {
            setActiveSession(target);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                sessions,
                activeSession,
                login,
                signup,
                logout,
                switchAccount,
                isLoading,
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
