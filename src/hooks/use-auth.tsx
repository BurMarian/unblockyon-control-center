import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Permission } from "@/lib/core/permissions";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: string;
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: string[];
  permissions: string[];
  can: (permission: Permission) => boolean;
  hasRole: (role: string) => boolean;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  const loadAccess = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setRoles([]);
      setPermissions([]);
      return;
    }

    const [profileRes, rolesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, phone, avatar_url, status")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("role_id, roles ( key, name, role_permissions ( permissions ( key ) ) )")
        .eq("user_id", userId),
    ]);

    setProfile((profileRes.data as Profile | null) ?? null);

    const rows = (rolesRes.data ?? []) as Array<{
      roles: { key: string; role_permissions: Array<{ permissions: { key: string } | null }> } | null;
    }>;

    const roleKeys = rows.map((r) => r.roles?.key).filter((k): k is string => Boolean(k));
    const permKeys = new Set<string>();
    for (const row of rows) {
      for (const rp of row.roles?.role_permissions ?? []) {
        if (rp.permissions?.key) permKeys.add(rp.permissions.key);
      }
    }

    setRoles(roleKeys);
    setPermissions([...permKeys]);
  }, []);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setRoles([]);
        setPermissions([]);
      }
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await loadAccess(data.session?.user.id);
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadAccess]);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    void loadAccess(userId);
  }, [userId, loadAccess]);

  const value = useMemo<AuthState>(() => {
    const permSet = new Set(permissions);
    const roleSet = new Set(roles);
    return {
      loading,
      session,
      user: session?.user ?? null,
      profile,
      roles,
      permissions,
      can: (permission) => roleSet.has("superadmin") || permSet.has(permission),
      hasRole: (role) => roleSet.has(role),
      refresh: async () => {
        await loadAccess(session?.user.id);
      },
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signUp: async (email, password, fullName) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName },
          },
        });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [loading, session, profile, roles, permissions, loadAccess]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
