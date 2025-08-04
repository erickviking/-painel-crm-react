// Ficheiro: src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

// 1️⃣ Cria o Contexto
const AuthContext = createContext();

// 2️⃣ Cria o Provedor do Contexto
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pega a sessão atual ao carregar o app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuta mudanças na sessão (login, logout)
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user || null,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3️⃣ Hook customizado para usar o contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
