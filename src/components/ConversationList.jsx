// File: src/components/ConversationList.jsx (Com a correção do Debounce)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiEdit2 } from 'react-icons/fi'; 
import { supabase } from '../supabaseClient';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './ConversationList.css';

// --- HOOK CUSTOMIZADO PARA DEBOUNCE (REINSERIDO) ---
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

const formatRelativeTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return 'Ontem';
    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
};

const ConversationItem = React.memo(({ conversation, isSelected, onClick }) => {
    const { patient_name, patient_phone, created_at } = conversation;

    // Estados para controlar o modo de edição e o valor do nome
    const [isEditing, setIsEditing] = useState(false);
    const [nameValue, setNameValue] = useState(patient_name || patient_phone);

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameValue)}&background=random&size=48`;

    // Função para salvar o novo nome no Supabase
    const handleSaveName = async (e) => {
        // Impede que o clique no botão "Salvar" selecione a conversa inteira
        e.stopPropagation(); 
        
        if (!nameValue.trim() || nameValue.trim() === patient_phone) {
            // Se o nome estiver vazio ou for igual ao telefone, não faz nada
            setIsEditing(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('patients')
                .update({ name: nameValue.trim() })
                .eq('phone', patient_phone);

            if (error) {
                throw error;
            }
            
            console.log(`Nome do contato ${patient_phone} atualizado para: ${nameValue.trim()}`);
            setIsEditing(false); // Volta para o modo de visualização

        } catch (error) {
            console.error("Erro ao atualizar o nome do paciente:", error.message);
            // Poderia adicionar um alerta para o usuário aqui
        }
    };

    const handleEditClick = (e) => {
        // Impede que o clique no ícone selecione a conversa
        e.stopPropagation(); 
        setIsEditing(true);
    };

    return (
        <div className={`conversation-item ${isSelected ? 'selected' : ''}`} onClick={onClick}>
            <img src={avatar} alt="Avatar" className="convo-item__avatar" loading="lazy" />
            <div className="convo-item__details">
                <div className="convo-item__header">

                    {/* Lógica de renderização condicional */}
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


const ConversationList = ({ clinicId, onSelectConversation, selectedPatientPhone }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- DECLARAÇÃO DA VARIÁVEL FALTANTE (REINSERIDA) ---
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        const fetchConversations = async () => {
            if (!clinicId) { setLoading(false); return; }
            setLoading(true);
            try {
                const { data, error } = await supabase.rpc('get_latest_messages_per_patient', { 
                    target_clinic_id: clinicId 
                });
                if (error) throw error;
                setConversations(data || []);
            } catch (error) {
                console.error('❌ Erro ao buscar dados das conversas:', error.message);
                setConversations([]);
            } finally { 
                setLoading(false); 
            }
        };
        fetchConversations();
        const channel = supabase.channel('public:messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchConversations).subscribe();
        return () => supabase.removeChannel(channel);
    }, [clinicId]);
    
    const filteredConversations = useMemo(() => {
        return (conversations || [])
            .filter(c => {
                // Agora a variável debouncedSearchTerm existe e a busca funciona
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