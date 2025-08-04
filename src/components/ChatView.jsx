// File: src/components/ChatView.jsx

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import ChatViewSkeleton from './ChatViewSkeleton';
import './ChatView.css';
import { FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

// --- COMPONENTE DE MENSAGEM ---
const ChatMessage = ({ message }) => (
  <div className={`message-row ${message.direction}`}>
    <div className="message-bubble">
      <div className="message-content">
        <span>{message.content}</span>
      </div>
      <div className="message-meta">
        <span className="message-time">
          {message.created_at
            ? new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </span>
      </div>
    </div>
  </div>
);

// --- SIDEBAR DE RESUMO ---
const SummarySidebar = ({ summary, isLoading, onGenerate }) => (
  <div className="summary-sidebar">
    <h4 className="summary-title">Resumo da Conversa</h4>
    <div className="summary-content">
      {isLoading ? (
        <p className="summary-loading">Carregando...</p>
      ) : (
        <p className="summary-text">
          {summary || 'Nenhum resumo gerado. Clique para criar ou atualizar.'}
        </p>
      )}
    </div>
    <button onClick={onGenerate} className="btn btn-secondary" disabled={isLoading}>
      {isLoading ? 'Gerando...' : 'Gerar / Atualizar Resumo'}
    </button>
  </div>
);

// --- COMPONENTE PRINCIPAL ---
const ChatView = ({ patientPhone, clinicId }) => {
  const { session } = useAuth();
  const [messages, setMessages] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [status, setStatus] = useState('lead');
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll automático quando mensagens atualizam
  useEffect(() => {
    if (!loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Buscar dados da conversa
  useEffect(() => {
    if (!patientPhone || !clinicId) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [messagesRes, patientRes, summaryRes] = await Promise.all([
          supabase
            .from('messages')
            .select('*')
            .eq('patient_phone', patientPhone)
            .eq('clinic_id', clinicId)
            .order('created_at', { ascending: true }),

          supabase
            .from('patients')
            .select('name, status')
            .eq('phone', patientPhone)
            .single(),

          supabase
            .from('conversation_summaries')
            .select('summary')
            .eq('phone', patientPhone)
            .eq('clinic_id', clinicId)
            .single(),
        ]);

        if (messagesRes.error) throw messagesRes.error;
        setMessages(messagesRes.data || []);

        if (!patientRes.error || patientRes.status === 406) {
          setPatientName(patientRes.data?.name || patientPhone);
          setStatus(patientRes.data?.status || 'lead');
        }

        if (!summaryRes.error || summaryRes.status === 406) {
          setSummary(summaryRes.data?.summary || '');
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados da conversa:', error.message);
      } finally {
        setLoading(false);
        setIsSummaryLoading(false);
      }
    };

    fetchAllData();

    // --- Canal em tempo real ---
    const channel = supabase
      .channel(`realtime-chat:${patientPhone}`)
      .on('broadcast', { event: 'new_message' }, (response) => {
        const newMessage = response.payload;
        if (newMessage.patient_phone === patientPhone) {
          setMessages((current) => [...current, newMessage]);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [patientPhone, clinicId, session?.access_token]);

  // Envio de mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const textToSend = inputValue.trim();
    setInputValue('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/v1/conversations/${patientPhone}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToSend,
            clinicId: clinicId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro de rede ao tentar enviar mensagem:', error);
      alert(`Erro de rede: ${error.message}`);
    }
  };

  // Atualização do status do paciente
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    await supabase.from('patients').update({ status: newStatus }).eq('phone', patientPhone);
  };

  // Geração de resumo
  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/v1/conversations/${patientPhone}/summarize`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clinicId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Erro ao gerar resumo.');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error('❌ Erro ao gerar resumo:', err);
      alert(`Erro ao gerar resumo: ${err.message}`);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // --- RENDER ---
  if (loading) return <ChatViewSkeleton />;

  return (
    <div className="chat-view-container">
      <div className="chat-main-panel">
        <div className="chat-header">
          <h3>{patientName}</h3>
          <select value={status} onChange={handleStatusChange}>
            <option value="lead">Lead</option>
            <option value="agendado">Agendado</option>
            <option value="perdido">Perdido</option>
            <option value="paciente">Paciente</option>
          </select>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="message-input"
            placeholder="Digite uma mensagem para enviar..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="btn btn-primary send-button" disabled={!inputValue.trim()}>
            <FaPaperPlane size={18} />
          </button>
        </form>
      </div>

      <SummarySidebar summary={summary} isLoading={isSummaryLoading} onGenerate={handleGenerateSummary} />
    </div>
  );
};

export default ChatView;
