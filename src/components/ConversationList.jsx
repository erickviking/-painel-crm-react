// File: src/components/ConversationList.jsx (Versão Corrigida com Sincronização de Status)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiEdit2 } from 'react-icons/fi'; 
import { supabase } from '../supabaseClient';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './ConversationList.css';

// --- HOOK CUSTOMIZADO PARA DEBOUNCE (sem alterações) ---
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

// --- FUNÇÃO DE FORMATAÇÃO DE TEMPO (sem alterações) ---
const formatRelativeTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return 'Ontem';
    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
};

// --- COMPONENTE DO ITEM DA CONVERSA (sem alterações) ---
const ConversationItem = React.memo(({ conversation, isSelected, onClick }) => {
    const { patient_name, patient_phone, created_at } = conversation;
    const [isEditing, setIsEditing] = useState(false);
    const [nameValue, setNameValue] = useState(patient_name || patient_phone);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameValue)}&background=random&size=48`;

    const handleSaveName = async (e) => {
        e.stopPropagation(); 
        if (!nameValue.trim() || nameValue.trim() === patient_phone) {
            setIsEditing(false);
            return;
        }
        try {
            const { error } = await supabase
                .from('patients')
                .update({ name: nameValue.trim() })
                .eq('phone', patient_phone);
            if (error) throw error;
            console.log(`Nome do contato ${patient_phone} atualizado para: ${nameValue.trim()}`);
            setIsEditing(false);
        } catch (error) {
            console.error("Erro ao atualizar o nome do paciente:", error.message);
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation(); 
        setIsEditing(true);
    };

    return (
        <div className={`conversation-item ${isSelected ? 'selected' : ''}`} onClick={onClick}>
            <img src={avatar} alt="Avatar" className="convo-item__avatar" loading="lazy" />
            <div className="convo-item__details">
                <div className="convo-item__header">
                    {isEditing ? (
                        <div className="edit-name-wrapper">
                            <input
                                type="text"
                                value={nameValue}
                                className="edit-name-input"
                                onChange={(e) => setNameValue(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                            <button className="save-name-button" onClick={handleSaveName}>Salvar</button>
                        </div>
                    ) : (
                        <span className="convo-item__name">
                            {nameValue}
                            <FiEdit2 className="edit-name-icon" onClick={handleEditClick} />
                        </span>
                    )}
                    <span className="convo-item__time">{formatRelativeTime(created_at)}</span>
                </div>
            </div>
        </div>
    );
});

// --- COMPONENTE PRINCIPAL DA LISTA (com alterações) ---
const ConversationList = ({ clinicId, onSelectConversation, selectedPatientPhone }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // ### INÍCIO DA ALTERAÇÃO ###
    useEffect(() => {
        const fetchConversations = async () => {
            if (!clinicId) { setLoading(false); return; }
            // Não definimos mais setLoading(true) aqui para evitar piscar a tela em atualizações em tempo real
            try {
                const { data, error } = await supabase.rpc('get_latest_messages_per_patient', {
                    target_clinic_id: clinicId
                });
                if (error) throw error;
                const normalized = (data || []).map(c => ({
                    ...c,
                    status: c.status ?? c.patient_status ?? null,
                }));
                setConversations(normalized);
            } catch (error) {
                console.error('❌ Erro ao buscar dados das conversas:', error.message);
                setConversations([]);
            } finally { 
                setLoading(false); 
            }
        };

        // Carregamento inicial
        setLoading(true);
        fetchConversations();

        // Listener para NOVAS MENSAGENS
        const messagesChannel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
                console.log('Nova mensagem detectada, recarregando conversas.');
                fetchConversations();
            })
            .subscribe();

        // Listener para ATUALIZAÇÕES DE PACIENTES (status, nome, etc.)
        const patientsChannel = supabase
            .channel('public:patients')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'patients' }, (payload) => {
                console.log('Atualização em paciente detectada, recarregando conversas.', payload);
                fetchConversations();
            })
            .subscribe();

        // Limpeza dos canais ao desmontar o componente
        return () => {
            supabase.removeChannel(messagesChannel);
            supabase.removeChannel(patientsChannel);
        };
    }, [clinicId]);
    // ### FIM DA ALTERAÇÃO ###
    
    const filteredConversations = useMemo(() => {
        return (conversations || [])
            .filter(c => {
                if (!debouncedSearchTerm) return true;
                const term = debouncedSearchTerm.toLowerCase();
                return (c.patient_name || '').toLowerCase().includes(term) || c.patient_phone.includes(term);
            })
            .filter(c => filterStatus === 'all' || c.status === filterStatus)
            .filter(c => {
                if (filterDate === 'all') return true;
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return new Date(c.created_at) >= sevenDaysAgo;
            });
    }, [conversations, debouncedSearchTerm, filterStatus, filterDate]);

    const parentRef = useRef();
    const rowVirtualizer = useVirtualizer({
        count: filteredConversations.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 76,
        overscan: 10,
    });
    
    const getStatusCount = (status) => (conversations || []).filter(c => c && c.status === status).length;

    return (
        <div className="conversation-list">
            <div className="list-header">
                <h2>Conversas</h2>
                <input type="text" placeholder="Buscar por nome ou telefone..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="filters">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="status-filter">
                        <option value="all">Todos os Status</option>
                        <option value="lead">🟡 Leads ({getStatusCount('lead')})</option>
                        <option value="agendado">✅ Agendados ({getStatusCount('agendado')})</option>
                        <option value="perdido">❌ Perdidos ({getStatusCount('perdido')})</option>
                        <option value="paciente">🩺 Pacientes ({getStatusCount('paciente')})</option>
                    </select>
                    <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="status-filter">
                        <option value="all">Todas as Datas</option>
                        <option value="7d">Últimos 7 dias</option>
                    </select>
                </div>
            </div>
            <div ref={parentRef} className="list-body">
                {loading ? <div className="list-loading">Carregando...</div> : (
                    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                            const convo = filteredConversations[virtualItem.index];
                            if (!convo) return null;
                            return (
                                <div key={convo.patient_phone} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${virtualItem.size}px`, transform: `translateY(${virtualItem.start}px)`}}>
                                    <ConversationItem conversation={convo} isSelected={convo.patient_phone === selectedPatientPhone} onClick={() => onSelectConversation(convo.patient_phone)} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;