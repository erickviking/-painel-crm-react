import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const fallbackConversations = [
  { patient_phone: '11999999999', name: 'Paciente A' },
  { patient_phone: '11888888888', name: 'Paciente B' },
];

function ConversationList({ clinicId, selectedPatientPhone, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!clinicId) return;

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('patient_phone')
          .eq('clinic_id', clinicId)
          .order('created_at', { ascending: false });

        if (error || !data) {
          console.error('Erro ao buscar conversas:', error);
          setConversations(fallbackConversations);
          return;
        }

        const unique = [];
        data.forEach((row) => {
          if (!unique.includes(row.patient_phone)) {
            unique.push(row.patient_phone);
          }
        });
        setConversations(unique.map((phone) => ({ patient_phone: phone })));
      } catch (err) {
        console.error('Erro ao buscar conversas:', err);
        setConversations(fallbackConversations);
      }
    };

    fetchConversations();
  }, [clinicId]);

  return (
    <div className="conversation-list">
      {conversations.map((conv) => (
        <div
          key={conv.patient_phone}
          onClick={() => onSelectConversation(conv.patient_phone)}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            backgroundColor:
              conv.patient_phone === selectedPatientPhone ? '#e6f2ff' : 'transparent',
            borderBottom: '1px solid #ddd',
          }}
        >
          {conv.name || conv.patient_phone}
        </div>
      ))}
    </div>
  );
}

export default ConversationList;
