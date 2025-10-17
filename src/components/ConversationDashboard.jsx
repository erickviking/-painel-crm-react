// Arquivo: src/components/ConversationDashboard.jsx (Novo)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import ConversationList from './ConversationList';
import ChatView from './ChatView';

const ConversationDashboard = () => {
  const { user } = useAuth();
  const [clinicId, setClinicId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPatientPhone, setSelectedPatientPhone] = useState(null);

  // Efeito para buscar o ID da clínica do usuário logado
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('clinics') // A tabela correta é 'clinics'
        .select('id')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching clinic profile:', error);
      }

      setClinicId(data?.id || user.id); // O ID da clínica é o mesmo do usuário logado
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading clinic profile...</div>;
  }

  if (!clinicId) {
    return <div style={{ padding: '2rem', color: 'red' }}>Could not load the clinic profile. Please contact support.</div>;
  }

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
            <p>Select a conversation to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationDashboard;
