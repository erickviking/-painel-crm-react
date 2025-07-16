// File: src/App.jsx (Versão Final com Navegação e Página de Configurações)

import React, { useState } from 'react';
import Conversations from './pages/Conversations';
import Settings from './pages/Settings';
import './App.css'; // O CSS geral que contém o layout

function App() {
  // Em uma aplicação real, o ID da clínica viria do login do usuário.
  const [clinicId] = useState('dd6a92e1-6ab5-4411-b752-d7f55151f293');
  
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
        return <Conversations clinicId={clinicId} />;
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
      </nav>

      {/* ÁREA DE CONTEÚDO PRINCIPAL QUE MUDA DINAMICAMENTE */}
      <main className="main-content">
        {renderPageContent()}
      </main>
    </div>
  );
}

export default App;
