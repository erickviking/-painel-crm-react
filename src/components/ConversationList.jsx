import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { enUS } from 'date-fns/locale'; // Changed to English locale
import './ConversationList.css';

// --- CUSTOM DEBOUNCE HOOK (No changes) ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- TIME FORMATTING FUNCTION (Translated) ---
const formatRelativeTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return formatDistanceToNow(d, { addSuffix: true, locale: enUS });
};

// --- CONVERSATION ITEM (Translated) ---
const ConversationItem = React.memo(({ conversation, isSelected, onClick }) => {
  const { patient_name, patient_phone, created_at, last_message } = conversation;
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
      console.log(`Contact name ${patient_phone} updated to: ${nameValue.trim()}`);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating patient name:', error.message);
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
              <button className="save-name-button" onClick={handleSaveName}>
                Save
              </button>
            </div>
          ) : (
            <span className="convo-item__name">
              {nameValue}
              <FiEdit2 className="edit-name-icon" onClick={handleEditClick} />
            </span>
          )}
          <span className="convo-item__time">{formatRelativeTime(created_at)}</span>
        </div>
        {last_message && (
          <p className="convo-item__last-message">{last_message}</p>
        )}
      </div>
    </div>
  );
});

// --- MAIN LIST COMPONENT (Updated with robust real-time listeners) ---
const ConversationList = ({ clinicId, onSelectConversation, selectedPatientPhone }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ### START OF NECESSARY CHANGES ###
  // This useEffect now contains the robust real-time logic
  useEffect(() => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase.rpc('get_latest_messages_per_patient', {
          target_clinic_id: clinicId,
        });
        if (error) throw error;
        setConversations(data || []);
      } catch (error) {
        console.error('❌ Error fetching conversations:', error.message);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchConversations();

    // Consolidated callback for real-time events
    const handleRealtimeUpdate = (payload) => {
      console.log('Real-time change detected, refetching conversations:', payload);
      fetchConversations();
    };

    // Channel for NEW MESSAGES for the current clinic
    const messagesChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `clinic_id=eq.${clinicId}` }, handleRealtimeUpdate)
      .subscribe();

    // Channel for NEW PATIENTS and STATUS UPDATES for the current clinic
    const patientsChannel = supabase
      .channel('public:patients')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patients', filter: `clinic_id=eq.${clinicId}` }, handleRealtimeUpdate)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'patients', filter: `clinic_id=eq.${clinicId}` }, handleRealtimeUpdate)
      .subscribe();

    // Cleanup function to remove both channels
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(patientsChannel);
    };
  }, [clinicId]);
  // ### END OF NECESSARY CHANGES ###

  const filteredConversations = useMemo(() => {
    return (conversations || [])
      .filter((c) => {
        if (!debouncedSearchTerm) return true;
        const term = debouncedSearchTerm.toLowerCase();
        return (c.patient_name || '').toLowerCase().includes(term) || c.patient_phone.includes(term);
      })
      .filter((c) => filterStatus === 'all' || c.status === filterStatus)
      .filter((c) => {
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

  const getStatusCount = (status) =>
    (conversations || []).filter((c) => c && c.status === status).length;

  return (
    <div className="conversation-list">
      <div className="list-header">
        <h2>Conversations</h2>
        <input
          type="text"
          placeholder="Search by name or phone..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="lead">🟡 Leads ({getStatusCount('lead')})</option>
            <option value="agendado">✅ Scheduled ({getStatusCount('agendado')})</option>
            <option value="perdido">❌ Lost ({getStatusCount('perdido')})</option>
            <option value="paciente">🩺 Patients ({getStatusCount('paciente')})</option>
          </select>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Dates</option>
            <option value="7d">Last 7 days</option>
          </select>
        </div>
      </div>
      <div ref={parentRef} className="list-body">
        {loading ? (
          <div className="list-loading">Loading...</div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const convo = filteredConversations[virtualItem.index];
              if (!convo) return null;
              return (
                <div
                  key={convo.patient_phone}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <ConversationItem
                    conversation={convo}
                    isSelected={convo.patient_phone === selectedPatientPhone}
                    onClick={() => onSelectConversation(convo.patient_phone)}
                  />
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