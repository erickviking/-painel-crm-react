import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/settings.service';

const Settings = ({ clinicId }) => {
    const [googleCalendarId, setGoogleCalendarId] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        getSettings(clinicId)
            .then(data => {
                setGoogleCalendarId(data.google_calendar_id || '');
            })
            .catch(err => setMessage(`Erro: ${err.message}`))
            .finally(() => setLoading(false));
    }, [clinicId]);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('Salvando...');
        try {
            await saveSettings(clinicId, { google_calendar_id: googleCalendarId });
            setMessage('Configurações salvas com sucesso!');
        } catch (err) {
            setMessage(`Erro: ${err.message}`);
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="settings-container" style={{ padding: '2rem' }}>
            <h1>Configurações da Clínica</h1>
            <form onSubmit={handleSave}>
                <label>ID da Agenda do Google:</label>
                <input
                    type="text"
                    value={googleCalendarId}
                    onChange={(e) => setGoogleCalendarId(e.target.value)}
                />
                <button type="submit">Salvar</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Settings;
