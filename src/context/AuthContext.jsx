import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null); // stores the profile from DB
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, authUser) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // Fallback using auth user metadata if profile table fetch fails
        if (authUser) {
          return {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email.split("@")[0],
            role: authUser.user_metadata?.role || "Member",
            points: 0,
            tier: "Bronze",
            phone: authUser.user_metadata?.phone || "",
            avatar_url: authUser.user_metadata?.avatar_url || "https://randomuser.me/api/portraits/lego/1.jpg",
          };
        }
        return null;
      }
      return data;
    } catch (err) {
      console.error("Profile query error:", err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      const profile = await fetchProfile(session.user.id, session.user);
      setUser(profile);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user) {
        const profile = await fetchProfile(initialSession.user.id, initialSession.user);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const profile = await fetchProfile(currentSession.user.id, currentSession.user);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      throw error;
    }
    return data;
  };

  const signUp = async (email, password, metadata = {}) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) {
      setLoading(false);
      throw error;
    }
    return data;
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
