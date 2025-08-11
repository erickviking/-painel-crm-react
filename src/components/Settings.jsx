// File: src/components/Settings.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Adjust the path if necessary

const Settings = ({ clinicId }) => {
    const [googleCalendarId, setGoogleCalendarId] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Effect to fetch the current clinic settings when the component loads
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
                setMessage(`Error loading settings: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchClinicSettings();
    }, [clinicId]);

    // Function to save changes via API
    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setMessage('Saving...');
        
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const response = await fetch(`${apiUrl}/api/v1/clinics/${clinicId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    // Authentication (if needed) would go here
                },
                body: JSON.stringify({ google_calendar_id: googleCalendarId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save settings.');
            }

            setMessage('Settings saved successfully!');

        } catch (err) {
            setMessage(`Error: ${err.message}`);
        }
    };

    if (loading) {
        return <div>Loading settings...</div>;
    }

    return (
        <div className="settings-container" style={{ padding: '2rem' }}>
            <h1>Settings</h1>
            <form onSubmit={handleSaveChanges}>
                <fieldset style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
                    <legend style={{ padding: '0 0.5rem' }}>Google Calendar Integration</legend>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="google-calendar-id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Google Calendar ID
                        </label>
                        <input
                            id="google-calendar-id"
                            type="text"
                            value={googleCalendarId}
                            onChange={(e) => setGoogleCalendarId(e.target.value)}
                            placeholder="example@group.calendar.google.com"
                            style={{ width: '400px', padding: '0.5rem', fontSize: '1rem' }}
                        />
                         <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0 0 0' }}>
                            Share your calendar with our service email and paste the Calendar ID here.
                        </p>
                    </div>
                </fieldset>
                <button type="submit" style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}>
                  Save Changes
                </button>
            </form>
            {message && <p style={{ marginTop: '1rem', color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
        </div>
    );
};

export default Settings;