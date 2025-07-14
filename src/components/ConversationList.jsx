import React from 'react';

// Simple conversation list placeholder
// Props:
// - clinicId: id of the clinic (unused here but kept for future use)
// - selectedPatientPhone: currently selected conversation phone
// - onSelectConversation: callback when a conversation is chosen
const ConversationList = ({ clinicId, selectedPatientPhone, onSelectConversation }) => {
  const placeholderConversations = [
    { id: 1, phone: '5511999999999', name: 'Paciente 1' },
    { id: 2, phone: '5511888888888', name: 'Paciente 2' }
  ];

  return (
    <div className="conversation-list">
      <h2>Conversas</h2>
      <ul>
        {placeholderConversations.map((conv) => (
          <li
            key={conv.id}
            onClick={() => onSelectConversation && onSelectConversation(conv.phone)}
            style={{
              cursor: 'pointer',
              fontWeight: conv.phone === selectedPatientPhone ? 'bold' : 'normal'
            }}
          >
            {conv.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
