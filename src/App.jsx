import React from 'react';
import ChatView from './components/ChatView';
import './App.css'; // Estilos gerais para a aplicação

function App() {
  // --- DADOS PARA TESTE ---
  // No futuro, estes dados virão de uma lista de conversas selecionada pelo usuário.
  // Por agora, vamos fixá-los para testar uma conversa específica.

  // AÇÃO 1: Coloque aqui o número de telefone do PACIENTE que você está usando para testar.
  // Formato: código do país + código de área + número (ex: 5511999998888)
  const patientPhoneForDemo = '551151995795'; 

  // AÇÃO 2: Vá no Supabase, na tabela 'clinics', copie o 'id' da clínica e cole aqui.
const clinicIdForDemo = 'dd6a92e1-6ab5-4411-b752-d7f55151f293';

  return (
    <div className="App">
      <header className="App-header">
        <h1>Painel de Acompanhamento de Conversas</h1>
      </header>
      <main>
        {/* Passamos os dados de teste para o componente de chat */}
        <ChatView 
          patientPhone={patientPhoneForDemo} 
          clinicId={clinicIdForDemo} 
        />
      </main>
    </div>
  );
}

export default App;