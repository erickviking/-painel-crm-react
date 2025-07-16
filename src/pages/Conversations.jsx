import React, { useState } from 'react';
import ConversationList from '../components/ConversationList';
import ChatView from '../components/ChatView';

const Conversations = ({ clinicId }) => {
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
          <ChatView patientPhone={selectedPatientPhone} clinicId={clinicId} />
        ) : (
          <div className="chat-placeholder">
            <p>Selecione uma conversa para começar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;
