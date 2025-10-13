import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage = () => {
  // Estado para o consentimento do WhatsApp
  const [hasConsent, setHasConsent] = useState(false);
  const [isConsentLoading, setIsConsentLoading] = useState(true);
  
  // Estado para o Google Calendar
  const [googleCalendarId, setGoogleCalendarId] = useState('');
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  
  // Estado geral
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const { user } = useAuth();
  const clinicId = user?.id; // O ID da clínica é o ID do usuário logado

  // Efeito para buscar TODOS os dados da clínica ao carregar
  useEffect(() => {
    if (!clinicId) {
      setError("Clinic not identified. Please log in again.");
      setIsConsentLoading(false);
      setIsCalendarLoading(false);
      return;
    }

    const fetchClinicData = async () => {
      setError('');
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('whatsapp_consent_given, google_calendar_id')
          .eq('id', clinicId)
          .single();
        
        if (error) throw error;
        
        setHasConsent(data.whatsapp_consent_given);
        setGoogleCalendarId(data.google_calendar_id || '');

      } catch (err) {
        setError('Failed to load clinic settings.');
        console.error(err);
      } finally {
        setIsConsentLoading(false);
        setIsCalendarLoading(false);
      }
    };
    fetchClinicData();
  }, [clinicId]);

  // Função para conceder o consentimento do WhatsApp
  const handleGrantConsent = async () => {
    setIsConsentLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Invalid session. Please log in again.");

      const response = await fetch('/api/v1/clinics/whatsapp-consent', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to authorize. Please try again.');
      }
    
      setHasConsent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConsentLoading(false);
    }
  };

  // Função para salvar o ID do Google Calendar
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaveMessage('Saving...');
    setError('');
    try {
      // Usando o Supabase client-side para o PATCH, pois a RLS já deve proteger a tabela.
      // Isso simplifica a autenticação.
      const { error } = await supabase
        .from('clinics')
        .update({ google_calendar_id: googleCalendarId })
        .eq('id', clinicId);

      if (error) throw error;

      setSaveMessage('Settings saved successfully!');
    } catch (err) {
      setSaveMessage('');
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111' }}>Settings</h1>
      
      {error && <p style={{ color: '#c53030', backgroundColor: '#fed7d7', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</p>}
      
      {/* Seção de Consentimento do WhatsApp */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#222' }}>WhatsApp Integration</h2>
        {isConsentLoading ? <p>Loading connection status...</p> : (
            hasConsent ? (
              <div style={{ backgroundColor: '#f0fff4', padding: '1rem', borderRadius: '6px', border: '1px solid #9ae6b4' }}>
                 <span style={{ color: '#2f855a', fontWeight: '600' }}>Connected</span>
                <p style={{ color: '#4a5568', marginTop: '0.5rem', marginBlockEnd: 0 }}>Your CRM is authorized to manage WhatsApp messages.</p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#fffaf0', padding: '1rem', borderRadius: '6px', border: '1px solid #f6e05e' }}>
                <h3 style={{ fontWeight: 'bold', color: '#975a16', marginTop: 0 }}>Authorization Required</h3>
                <p style={{ color: '#4a5568', margin: '1rem 0', lineHeight: '1.6' }}>
                  To allow M2ia to manage your clinic's WhatsApp Business messages, you must grant permission. This will allow our platform to receive messages from your patients and send replies on your behalf.
                </p>
                <button
                  onClick={handleGrantConsent}
                  disabled={isConsentLoading}
                  style={{...styles.button, backgroundColor: isConsentLoading ? '#a0aec0' : '#0369a1'}}
                >
                  {isConsentLoading ? 'Authorizing...' : 'Authorize WhatsApp Connection'}
                </button>
              </div>
            )
        )}
      </div>

      {/* Seção do Google Calendar */}
      <form onSubmit={handleSaveChanges} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#222' }}>Google Calendar Integration</h2>
        {isCalendarLoading ? <p>Loading calendar settings...</p> : (
            <>
              <div>
                  <label htmlFor="google-calendar-id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                      Google Calendar ID
                  </label>
                  <input
                      id="google-calendar-id"
                      type="text"
                      value={googleCalendarId}
                      onChange={(e) => setGoogleCalendarId(e.target.value)}
                      placeholder="example@group.calendar.google.com"
                      style={styles.input}
                  />
                   <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0 0 0' }}>
                      Share your calendar with our service email and paste the Calendar ID here.
                  </p>
              </div>
              <button type="submit" style={{...styles.button, marginTop: '1.5rem'}}>
                Save Changes
              </button>
              {saveMessage && <p style={{ marginTop: '1rem', color: saveMessage.startsWith('Error') ? 'red' : 'green' }}>{saveMessage}</p>}
            </>
        )}
      </form>
    </div>
  );
};

// Estilos para reutilização
const styles = {
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  button: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
};

export default SettingsPage;
