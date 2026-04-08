import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { api, adminSessionStorage } from '@/lib/api';
import { AuthSession } from '@/types';

type AdminAuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AdminAuthContextValue = {
  session: AuthSession | null;
  status: AdminAuthStatus;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthSession | null>;
  hasRole: (...roles: string[]) => boolean;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);
const REFRESH_BUFFER_MS = 60_000;

function decodeJwtExpiry(token?: string) {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const parsed = JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof parsed.exp === 'number' ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isTokenFresh(token?: string, bufferMs = REFRESH_BUFFER_MS) {
  const expiry = decodeJwtExpiry(token);
  if (!expiry) return false;
  return expiry - bufferMs > Date.now();
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(adminSessionStorage.get());
  const [status, setStatus] = useState<AdminAuthStatus>('loading');
  const refreshInFlight = useRef<Promise<AuthSession | null> | null>(null);

  const clearSession = () => {
    setSession(null);
    setStatus('unauthenticated');
  };

  const refreshSession = async (): Promise<AuthSession | null> => {
    if (!session?.refreshToken) {
      clearSession();
      return null;
    }

    if (refreshInFlight.current) {
      return refreshInFlight.current;
    }

    refreshInFlight.current = api.auth
      .refresh(session.refreshToken)
      .then((nextSession) => {
        setSession(nextSession);
        setStatus('authenticated');
        return nextSession;
      })
      .catch(() => {
        clearSession();
        return null;
      })
      .finally(() => {
        refreshInFlight.current = null;
      });

    return refreshInFlight.current;
  };

  useEffect(() => {
    let cancelled = false;

    const hydrateSession = async () => {
      if (!session?.accessToken || !session?.refreshToken) {
        if (!cancelled) {
          setStatus('unauthenticated');
        }
        return;
      }

      if (!isTokenFresh(session.accessToken, 0)) {
        const refreshed = await refreshSession();
        if (!cancelled && !refreshed) {
          setStatus('unauthenticated');
        }
        return;
      }

      if (!session.user) {
        try {
          const user = await api.auth.me(session.accessToken);
          if (!cancelled) {
            setSession((current) => (current ? { ...current, user: user as AuthSession['user'] } : current));
            setStatus('authenticated');
          }
        } catch {
          const refreshed = await refreshSession();
          if (!cancelled && !refreshed) {
            setStatus('unauthenticated');
          }
        }
        return;
      }

      if (!cancelled) {
        setStatus('authenticated');
      }
    };

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, session?.refreshToken, session?.user]);

  useEffect(() => {
    adminSessionStorage.set(session);
  }, [session]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) return;

    const expiry = decodeJwtExpiry(session.accessToken);
    if (!expiry) return;

    const timeoutMs = Math.max(expiry - Date.now() - REFRESH_BUFFER_MS, 5_000);
    const timeoutId = window.setTimeout(() => {
      void refreshSession();
    }, timeoutMs);

    return () => window.clearTimeout(timeoutId);
  }, [session?.accessToken, status]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      session,
      status,
      isAuthenticated: status === 'authenticated',
      isReady: status !== 'loading',
      async login(email, password) {
        const response = await api.auth.login(email, password);
        setSession(response);
        setStatus('authenticated');
      },
      async logout() {
        if (session?.accessToken) {
          try {
            await api.auth.logout(session.accessToken);
          } catch {
            // ignore logout API failures and still clear local auth state
          }
        }
        clearSession();
      },
      refreshSession,
      hasRole(...roles) {
        const role = session?.user?.role?.name;
        if (!role) return false;
        return roles.includes(role);
      },
    }),
    [session, status],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
