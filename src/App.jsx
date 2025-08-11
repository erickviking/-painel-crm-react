// File: src/App.jsx (English Version for Meta Review)

// Forcing a new build for Vercel - August 11, 2025

import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext'; // Authentication hook
import { supabase } from './supabaseClient';
import ConversationList from './components/ConversationList';
import ChatView from './components/ChatView';
import Settings from './components/Settings';
import LoginPage from './pages/LoginPage.jsx';
import './App.css';

function App() {
  const { session, user, signOut } = useAuth();
  const [clinicId, setClinicId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [selectedPatientPhone, setSelectedPatientPhone] = useState(null);
  const [currentPage, setCurrentPage] = useState('conversations'); // Default page is now 'conversations'

  // 🔹 Effect to load the logged-in user's profile and get the clinicId
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

      if (error && error.code !== 'PGRST116') { // Ignore "No rows found" error
        console.error('Error fetching user profile:', error);
      }

      setClinicId(data?.clinic_id || null);
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [user]);

  // 🔹 If there is no session, show the login page
  if (!session) {
    return <LoginPage />;
  }

  // 🔹 While the profile is loading
  if (loadingProfile) {
    return (
      <div className="loading-screen">
        <p>Loading clinic profile...</p>
      </div>
    );
  }

  // 🔹 If there is no clinicId, notify the user
  if (!clinicId) {
    return (
      <div className="no-clinic-screen">
        <p>Could not load the clinic profile. Please contact support.</p>
        <button onClick={signOut}>Logout</button>
      </div>
    );
  }

  // 🔹 Conditional main content
  const renderPageContent = () => {
    switch (currentPage) {
      case 'settings':
        return <Settings clinicId={clinicId} />;

      case 'conversations':
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
                  <p>Select a conversation to get started</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* SIDE NAVIGATION MENU */}
      <nav className="app-nav">
        <ul>
          <li
            onClick={() => setCurrentPage('conversations')}
            className={currentPage === 'conversas' ? 'active' : ''}
          >
            <span role="img" aria-label="Conversations">💬</span> Conversations
          </li>
          <li
            onClick={() => setCurrentPage('settings')}
            className={currentPage === 'settings' ? 'active' : ''}
          >
            <span role="img" aria-label="Settings">⚙️</span> Settings
          </li>
        </ul>
        <div className="logout-container">
          <button onClick={signOut} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {renderPageContent()}
      </main>
    </div>
  );
}

export default App;