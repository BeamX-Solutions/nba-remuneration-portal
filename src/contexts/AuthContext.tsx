import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileComplete: boolean | null;
  profileStatus: string | null;
  profileName: string | null;
  profileBranch: string | null;
  profileAvatar: string | null;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profileComplete: null,
  profileStatus: null,
  profileName: null,
  profileBranch: null,
  profileAvatar: null,
  isAdmin: false,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileBranch, setProfileBranch] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const checkProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, surname, status, branch, avatar_url, is_admin")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return;
    setProfileComplete(!!(data?.first_name && data?.surname));
    setProfileStatus(data?.status ?? null);
    const name = [data?.first_name, data?.surname].filter(Boolean).join(" ");
    setProfileName(name || null);
    setProfileBranch(data?.branch ?? null);
    setProfileAvatar(data?.avatar_url ?? null);
    setIsAdmin(!!(data as any)?.is_admin);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await checkProfile(user.id);
  }, [user, checkProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) checkProfile(session.user.id);
      else setProfileComplete(null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // checkProfile is handled by onAuthStateChange above
    }).catch(() => {
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkProfile]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`profiles:${user.id}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const p = payload.new as any;
        if (p) {
          setProfileStatus(p.status ?? null);
          setProfileComplete(!!(p.first_name && p.surname));
          const name = [p.first_name, p.surname].filter(Boolean).join(" ");
          setProfileName(name || null);
          setProfileBranch(p.branch ?? null);
          setProfileAvatar(p.avatar_url ?? null);
          setIsAdmin(!!p.is_admin);
        }
      })
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") checkProfile(user.id);
      });
    return () => { channel.unsubscribe(); };
  }, [user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfileComplete(null);
    setProfileStatus(null);
    setProfileName(null);
    setProfileBranch(null);
    setProfileAvatar(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profileComplete, profileStatus, profileName, profileBranch, profileAvatar, isAdmin, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
