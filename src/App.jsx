// Arquivo: src/App.jsx (Corrigido e Final com Roteamento)
import React from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ConversationDashboard from './components/ConversationDashboard'; // Criaremos este a seguir

// Layout principal para usuários autenticados
function AppLayout() {
  const { signOut } = useAuth();
  return (
    <div className="app-container">
      <nav className="app-nav">
        <ul>
          {/* NavLink adiciona a classe 'active' automaticamente */}
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            <li>
              <span role="img" aria-label="Conversations">💬</span> Conversations
            </li>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <li>
              <span role="img" aria-label="Settings">⚙️</span> Settings
            </li>
          </NavLink>
        </ul>
        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <button onClick={signOut} style={{ width: '100%', padding: '0.5rem', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ConversationDashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Redireciona qualquer outra rota para o dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

// Componente principal que gerencia o roteamento
function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div>Loading session...</div>; // Evita piscar a tela de login
  }

  return (
    <Routes>
      {/* Se não houver sessão, a única rota acessível é /login */}
      {!session ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        // Se houver sessão, renderiza o layout principal para todas as rotas
        <Route path="/*" element={<AppLayout />} />
      )}
    </Routes>
  );
}

export default App;
