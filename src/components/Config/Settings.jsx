// File: src/components/Settings.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Ajuste o caminho se necessário

const Settings = ({ clinicId }) => {
    const [googleCalendarId, setGoogleCalendarId] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Efeito para buscar a configuração atual da clínica quando o componente carrega
    useEffect(() => {
        const fetchClinicSettings = async () => {
            if (!clinicId) return;
            
            setLoading(true);
            setMessage('');
            try {
                // Esta chamada requer que RLS esteja configurada na tabela 'clinics'
                const { data, error } = await supabase
                    .from('clinics')
                    .select('google_calendar_id')
                    .eq('id', clinicId)
                    .single();

                if (error) throw error;

                if (data) {
                    setGoogleCalendarId(data.google_calendar_id || '');
                }
            } catch (err) {
                setMessage(`Erro ao carregar configurações: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchClinicSettings();
    }, [clinicId]);

    // Função para salvar as alterações via API
    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setMessage('Salvando...');
        
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            // Esta chamada requer que o endpoint no backend esteja funcionando
            const response = await fetch(`${apiUrl}/api/v1/clinics/${clinicId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    // Autenticação (se necessária) iria aqui
                },
                body: JSON.stringify({ google_calendar_id: googleCalendarId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao salvar as configurações.');
            }

            setMessage('Configurações salvas com sucesso!');

        } catch (err) {
            setMessage(`Erro: ${err.message}`);
        }
    };

    if (loading) {
        return <div>Carregando configurações...</div>;
    }

    return (
        <div className="settings-container" style={{ padding: '2rem' }}>
            <h1>Configurações</h1>
            <form onSubmit={handleSaveChanges}>
                <fieldset style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
                    <legend style={{ padding: '0 0.5rem' }}>Integração com Google Agenda</legend>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="google-calendar-id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            ID da Agenda do Google
                        </label>
                        <input
                            id="google-calendar-id"
                            type="text"
                            value={googleCalendarId}
                            onChange={(e) => setGoogleCalendarId(e.target.value)}
                            placeholder="exemplo@group.calendar.google.com"
                            style={{ width: '400px', padding: '0.5rem', fontSize: '1rem' }}
                        />
                         <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0 0 0' }}>
                            Compartilhe sua agenda com o email do nosso serviço e cole o ID da agenda aqui.
                        </p>
                    </div>
                </fieldset>
                <button type="submit" style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}>
                  Salvar Alterações
                </button>
            </form>
            {message && <p style={{ marginTop: '1rem', color: message.startsWith('Erro') ? 'red' : 'green' }}>{message}</p>}
        </div>
    );
};

export default Settings;
