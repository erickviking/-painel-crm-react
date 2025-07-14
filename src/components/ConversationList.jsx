import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ConversationList = ({ clinicId, selectedPatientPhone, onSelectConversation }) => {
    const [phones, setPhones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            if (!clinicId) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('messages')
                .select('patient_phone')
                .eq('clinic_id', clinicId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao buscar conversas:', error);
                setPhones([]);
            } else {
                const uniquePhones = [...new Set(data.map((m) => m.patient_phone))];
                setPhones(uniquePhones);
            }
            setLoading(false);
        };

        fetchConversations();
    }, [clinicId]);

    if (loading) {
        return <div>Carregando conversas...</div>;
    }

    return (
        <ul className="conversation-list">
            {phones.map((phone) => (
                <li
                    key={phone}
                    onClick={() => onSelectConversation(phone)}
                    className={selectedPatientPhone === phone ? 'active' : ''}
                >
                    {phone}
                </li>
            ))}
        </ul>
    );
};

export default ConversationList;
