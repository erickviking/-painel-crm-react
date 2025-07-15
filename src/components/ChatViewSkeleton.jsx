// File: src/components/ChatViewSkeleton.jsx (Versão Corrigida)

import React from 'react';
import './ChatView.css';

const ChatViewSkeleton = () => {
    return (
        // O container principal que define o layout de duas colunas DEVE estar aqui.
        <div className="chat-view-container">
            
            {/* Coluna da Esquerda: O painel principal do chat */}
            <div className="chat-main-panel">
                <div className="chat-header">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-select"></div>
                </div>
                <div className="chat-messages">
                    <div className="skeleton-message-row-left"><div className="skeleton skeleton-bubble"></div></div>
                    <div className="skeleton-message-row-right"><div className="skeleton skeleton-bubble"></div></div>
                    <div className="skeleton-message-row-left"><div className="skeleton skeleton-bubble-short"></div></div>
                </div>
                <div className="chat-input">
                    <div className="skeleton skeleton-input"></div>
                    <div className="skeleton skeleton-button"></div>
                </div>
            </div>

            {/* Coluna da Direita: A sidebar de resumo */}
            <div className="summary-sidebar">
                <div className="skeleton skeleton-title" style={{ width: '80%' }}></div>
                <div className="skeleton skeleton-summary-content"></div>
                <div className="skeleton skeleton-button"></div>
            </div>
            
        </div>
    );
};

export default ChatViewSkeleton;