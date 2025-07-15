import React, { useState } from 'react';
import ConversationList from './components/ConversationList';
import ChatView from './components/ChatView';
import './App.css'; // Novo estilo com layout em 2 colunas

function App() {
  const [clinicId] = useState('dd6a92e1-6ab5-4411-b752-d7f55151f293'); // ID real da sua clínica
  const [selectedPatientPhone, setSelectedPatientPhone] = useState(null);

  return (
    <div className="app-container">
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

export default App;