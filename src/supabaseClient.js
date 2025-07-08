import { createClient } from '@supabase/supabase-js';

// Busca a URL e a chave Anon das variáveis de ambiente do Vite.
// O Vite expõe variáveis de ambiente prefixadas com "VITE_" no objeto `import.meta.env`.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Uma validação para garantir que as variáveis foram carregadas corretamente.
// Se não foram, o aplicativo irá falhar na inicialização com uma mensagem clara.
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) não foram encontradas. Verifique seu arquivo .env.local na raiz do projeto frontend.");
}

// Cria e exporta a instância única do cliente Supabase para ser usada em toda a aplicação.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);