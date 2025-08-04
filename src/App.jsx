// File: src/App.jsx (Versão Final com Supabase Auth e Multi-tenant)

import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext'; // Hook de autenticação
import { supabase } from './supabaseClient';
import ConversationList from './components/ConversationList';
import ChatView from './components/ChatView';
import Settings from './components/Settings';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const { session, user, signOut } = useAuth();
  const [clinicId, setClinicId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [selectedPatientPhone, setSelectedPatientPhone] = useState(null);
  const [currentPage, setCurrentPage] = useState('conversas');

  // 🔹 Efeito para carregar o perfil do usuário logado e pegar clinicId
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setClinicId(null);
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }

      setClinicId(data?.clinic_id || null);
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [user]);

  // 🔹 Se não houver sessão, mostra a página de login
  if (!session) {
    return <LoginPage />;
  }

  // 🔹 Enquanto o perfil está carregando
  if (loadingProfile) {
    return (
      <div className="loading-screen">
        <p>Carregando perfil da clínica...</p>
      </div>
    );
  }

  // 🔹 Se não houver clinicId, avisa o usuário
  if (!clinicId) {
    return (
      <div className="no-clinic-screen">
        <p>Não foi possível carregar o perfil da clínica.</p>
        <button onClick={signOut}>Sair</button>
      </div>
    );
  }

  // 🔹 Conteúdo principal condicional
  const renderPageContent = () => {
    switch (currentPage) {
      case 'settings':
        return <Settings clinicId={clinicId} />;

      case 'conversas':
      default:
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
                  <p>Selecione uma conversa para começar</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* MENU DE NAVEGAÇÃO LATERAL */}
      <nav className="app-nav">
        <ul>
          <li
            onClick={() => setCurrentPage('conversas')}
            className={currentPage === 'conversas' ? 'active' : ''}
          >
            <span role="img" aria-label="Conversas">💬</span> Conversas
          </li>
          <li
            onClick={() => setCurrentPage('settings')}
            className={currentPage === 'settings' ? 'active' : ''}
          >
            <span role="img" aria-label="Configurações">⚙️</span> Configurações
          </li>
        </ul>
        <div className="logout-container">
          <button onClick={signOut} className="logout-button">
            Sair
          </button>
        </div>
      </nav>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        {renderPageContent()}
      </main>
    </div>
  );
}

export default App;
