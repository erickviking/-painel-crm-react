// Arquivo: src/App.jsx (Versão Final e Corrigida com Roteamento)
import React, { useState, useEffect } from 'react';
// --- 1. IMPORTAÇÕES DO ROUTER ---
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { supabase } from './supabaseClient';
import ConversationList from './components/ConversationList';
import ChatView from './components/ChatView';
import Settings from './components/Settings'; // Sua página de configurações
import LoginPage from './pages/LoginPage.jsx';
import './App.css';

// --- NOVO COMPONENTE PARA O DASHBOARD DE CONVERSAS ---
function ConversationDashboard({ clinicId }) {
  const [selectedPatientPhone, setSelectedPatientPhone] = useState(null);

  return (
    <div className="crm-layout">
      <div className="sidebar">
        <ConversationList
          clinicId={clinicId}
          selectedPatientPhone={selectedPatientPhone}
          onSelectConversation={setSelectedPatientPhone}
        />
      </div>
      <div className="chat-area">
        {selectedPatientPhone ? (
          <ChatView
            patientPhone={selectedPatientPhone}
            clinicId={clinicId}
          />
        ) : (
          <div className="chat-placeholder">
            <p>Select a conversation to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}


// --- LAYOUT PRINCIPAL PARA USUÁRIOS LOGADOS ---
function AppLayout() {
    const { user, signOut } = useAuth();
    const [clinicId, setClinicId] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
          if (!user) {
            setLoadingProfile(false);
            return;
          }
    
          // A tabela correta é 'clinics', não 'profiles'.
          const { data, error } = await supabase
            .from('clinics')
            .select('id') // Selecionamos o ID para confirmar que existe
            .eq('id', user.id)
            .single();
    
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching clinic profile:', error);
          }
    
          setClinicId(data?.id || user.id); // O ID da clínica é o ID do usuário
          setLoadingProfile(false);
        };
    
        fetchProfile();
    }, [user]);

    if (loadingProfile) {
        return <div className="loading-screen"><p>Loading clinic profile...</p></div>;
    }

    if (!clinicId) {
        return (
          <div className="no-clinic-screen">
            <p>Could not load the clinic profile. Please contact support.</p>
            <button onClick={signOut}>Logout</button>
          </div>
        );
    }

    return (
        <div className="app-container">
            {/* MENU DE NAVEGAÇÃO CORRIGIDO */}
            <nav className="app-nav">
                <ul>
                    {/* Usamos NavLink em vez de li com onClick */}
                    <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <li><span role="img" aria-label="Conversations">💬</span> Conversations</li>
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <li><span role="img" aria-label="Settings">⚙️</span> Settings</li>
                    </NavLink>
                </ul>
                <div className="logout-container">
                    <button onClick={signOut} className="logout-button">Logout</button>
                </div>
            </nav>

            {/* ÁREA DE CONTEÚDO PRINCIPAL COM ROTAS */}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<ConversationDashboard clinicId={clinicId} />} />
                    <Route path="/settings" element={<Settings clinicId={clinicId} />} />
                    <Route path="*" element={<Navigate to="/" />} /> {/* Redireciona rotas não encontradas */}
                </Routes>
            </main>
        </div>
    );
}

// --- COMPONENTE APP PRINCIPAL ---
function App() {
  const { session, loading } = useAuth(); // Supondo que seu AuthContext tenha um 'loading'

  // Mostra uma tela de carregamento enquanto a sessão é verificada
  if (loading) {
    return <div>Loading session...</div>;
  }
  
  return (
    <Routes>
      {/* Se não houver sessão, renderiza apenas a rota de login */}
      {!session ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        // Se houver sessão, renderiza o layout principal para todas as outras rotas
        <Route path="/*" element={<AppLayout />} />
      )}
    </Routes>
  );
}

export default App;
