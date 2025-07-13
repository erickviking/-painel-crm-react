// File: src/components/Settings.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ajuste o caminho se necessário

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
            const response = await fetch(`${apiUrl}/api/v1/clinics/${clinicId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    // Se sua API exigir autenticação, o token JWT do Supabase iria aqui
                    // 'Authorization': `Bearer ${session.access_token}` 
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
            <h2>Configurações da Agenda</h2>
            <p>
                Para integrar com o Google Agenda, compartilhe sua agenda com o e-mail da nossa conta de serviço e cole o "ID da Agenda" abaixo.
            </p>
            <form onSubmit={handleSaveChanges}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="google-calendar-id" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        ID da Agenda do Google
                    </label>
                    <input
                        id="google-calendar-id"
                        type="text"
                        value={googleCalendarId}
                        onChange={(e) => setGoogleCalendarId(e.target.value)}
                        placeholder="exemplo@group.calendar.google.com"
                        style={{ width: '400px', padding: '0.5rem' }}
                    />
                </div>
                <button type="submit">Salvar Alterações</button>
            </form>
            {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
        </div>
    );
};

export default Settings;
