// File: src/App.jsx (Versão Final com Navegação e Página de Configurações)

import React, { useState } from 'react';
import ConversationList from './components/ConversationList';
import ChatView from './components/ChatView'; // Assumindo que este componente existe
import Settings from './components/Settings';
import './App.css'; // O CSS geral que contém o layout

function App() {
  // Em uma aplicação real, o ID da clínica viria do login do usuário.
  const [clinicId] = useState('dd6a92e1-6ab5-4411-b752-d7f55151f293');
  const [selectedPatientPhone, setSelectedPatientPhone] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Estado para controlar qual página está ativa: 'conversas' ou 'settings'
  const [currentPage, setCurrentPage] = useState('conversas'); 

  /**
   * Renderiza o conteúdo da página principal de forma condicional
   * com base no estado 'currentPage'.
   */
  const renderPageContent = () => {
    switch (currentPage) {
      case 'settings':
        // Se a página for 'settings', renderiza o componente de configurações
        return <Settings clinicId={clinicId} />;
      
      case 'conversas':
      default:
        // Por padrão, ou se for 'conversas', renderiza a visão de chat
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
      <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        ☰
      </button>
      {/* MENU DE NAVEGAÇÃO LATERAL */}
      <nav className={`app-nav ${isMenuOpen ? 'open' : ''}`}> 
        <ul>
          <li
            onClick={() => { setCurrentPage('conversas'); setIsMenuOpen(false); }}
            className={currentPage === 'conversas' ? 'active' : ''}
          >
            <span role="img" aria-label="Conversas">💬</span> Conversas
          </li>
          <li
            onClick={() => { setCurrentPage('settings'); setIsMenuOpen(false); }}
            className={currentPage === 'settings' ? 'active' : ''}
          >
            <span role="img" aria-label="Configurações">⚙️</span> Configurações
          </li>
        </ul>
      </nav>

      {/* ÁREA DE CONTEÚDO PRINCIPAL QUE MUDA DINAMICAMENTE */}
      <main className="main-content">
        {renderPageContent()}
      </main>
    </div>
  );
}

export default App;
