import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient'; // Importa o cliente Supabase
import ToggleSwitch from './ToggleSwitch';
import './ChatView.css';
import './ToggleSwitch.css';

// Componente para uma única bolha de mensagem (nenhuma alteração aqui)
const ChatMessage = ({ message }) => (
    <div className={`message-row ${message.direction}`}>
        <div className="message-bubble">
            <p>{message.content}</p>
            <span className="message-time">
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
    </div>
);


const ChatView = ({ patientPhone, clinicId }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAiActive, setIsAiActive] = useState(false);
    const messagesEndRef = useRef(null);

    const handleToggleAutomation = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_API_URL}/api/v1/patients/${patientPhone}/toggle-automation`,
                { method: 'PATCH' }
            );
            if (!response.ok) {
                console.error('Erro ao alternar automação');
                return;
            }
            const data = await response.json();
            if (typeof data.is_ai_active === 'boolean') {
                setIsAiActive(data.is_ai_active);
            }
        } catch (err) {
            console.error('Erro ao enviar requisição:', err);
        }
    };

    // Efeito para rolar para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Efeito para buscar o histórico e se inscrever nos ANÚNCIOS
    useEffect(() => {
        // 1. Busca o histórico inicial de mensagens (sem alterações aqui)
        const fetchMessages = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('patient_phone', patientPhone)
                .eq('clinic_id', clinicId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Erro ao buscar mensagens:', error);
            } else {
                setMessages(data);
            }

            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('is_ai_active')
                .eq('phone', patientPhone)
                .single();

            if (patientError) {
                console.error('Erro ao buscar paciente:', patientError);
            } else if (patientData) {
                setIsAiActive(patientData.is_ai_active);
            }

            setLoading(false);
        };

        fetchMessages();

        // --- INÍCIO DA MODIFICAÇÃO (Plano B) ---
        
        // 2. Se inscreve para receber os ANÚNCIOS enviados pelo backend
        const CHANNEL_NAME = 'realtime-chat'; // O nome DEVE ser o mesmo do backend
        const channel = supabase
            .channel(CHANNEL_NAME)
            .on(
                'broadcast', // <<< MUDANÇA PRINCIPAL: Ouvimos 'broadcast'
                { 
                    event: 'new_message' // <<< E filtramos pelo nome do nosso evento
                }, 
                (response) => {
                    // A nova mensagem vem dentro do 'payload' do anúncio
                    const newMessage = response.payload;
                    console.log('Nova mensagem recebida via broadcast!', newMessage);

                    // Como todos os painéis ouvem o mesmo canal, precisamos garantir
                    // que esta mensagem pertence à conversa que está aberta na tela.
                    if (newMessage.patient_phone === patientPhone) {
                        setMessages(currentMessages => [...currentMessages, newMessage]);
                    }
                }
            )
            .subscribe();
        
        console.log(`✅ Escutando broadcasts no canal: ${CHANNEL_NAME}`);

        // --- FIM DA MODIFICAÇÃO ---


        // 3. Função de limpeza (sem alterações aqui)
        return () => {
            console.log(`🔌 Desconectando do canal ${CHANNEL_NAME}`);
            supabase.removeChannel(channel);
        };

    }, [patientPhone, clinicId]);

    if (loading) {
        return <div>Carregando histórico de mensagens...</div>;
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <ToggleSwitch checked={isAiActive} onChange={handleToggleAutomation} />
            </div>
            <div className="chat-messages">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatView;