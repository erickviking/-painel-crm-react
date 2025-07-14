import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ConversationList = ({ clinicId, selectedPatientPhone, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('patient_phone, created_at')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar conversas:', error);
        setConversations([]);
      } else {
        const uniquePhones = [];
        data.forEach((row) => {
          if (!uniquePhones.includes(row.patient_phone)) {
            uniquePhones.push(row.patient_phone);
          }
        });
        setConversations(uniquePhones);
      }
      setLoading(false);
    };

    if (clinicId) {
      fetchConversations();
    }
  }, [clinicId]);

  if (loading) {
    return <div>Carregando conversas...</div>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {conversations.map((phone) => (
        <li
          key={phone}
          onClick={() => onSelectConversation(phone)}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            backgroundColor: phone === selectedPatientPhone ? '#e6f2ff' : 'transparent',
          }}
        >
          {phone}
        </li>
      ))}
    </ul>
  );
};

export default ConversationList;
