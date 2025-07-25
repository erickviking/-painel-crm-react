const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export async function getSettings(clinicId) {
  const response = await fetch(`${API_URL}/api/v1/settings/${clinicId}`);
  if (!response.ok) throw new Error('Falha ao buscar configurações.');
  return response.json();
}

export async function saveSettings(clinicId, data) {
  const response = await fetch(`${API_URL}/api/v1/settings/${clinicId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Falha ao salvar configurações.');
  }
  return response.json();
}
