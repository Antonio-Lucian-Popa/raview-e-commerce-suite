import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, adminSessionStorage } from '@/lib/api';
import { AuthSession } from '@/types';

type AdminAuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(adminSessionStorage.get());

  useEffect(() => {
    if (!session?.accessToken || session.user) return;

    let cancelled = false;

    api.auth
      .me(session.accessToken)
      .then((user) => {
        if (!cancelled) {
          setSession((current) => (current ? { ...current, user } : current));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    adminSessionStorage.set(session);
  }, [session]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.accessToken),
      async login(email, password) {
        const response = await api.auth.login(email, password);
        setSession(response);
      },
      async logout() {
        if (session?.accessToken) {
          try {
            await api.auth.logout(session.accessToken);
          } catch {
            // Keep logout resilient even if the token is already invalid.
          }
        }
        setSession(null);
      },
    }),
    [session],
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
