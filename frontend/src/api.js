const API_BASE = '/api';

async function parseResponse(res) {
  const text = await res.text();
  if (!text) {
    throw new Error(
      res.status === 502 || res.status === 504
        ? 'Weather service unavailable. Please try again.'
        : 'Server returned an empty response. Make sure the backend is running on port 3001.'
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid response from server. Make sure the backend is running on port 3001.');
  }
}

export async function fetchCurrentWeather(location) {
  const res = await fetch(`${API_BASE}/weather/current?location=${encodeURIComponent(location)}`);
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to fetch weather');
  return data;
}

export async function fetchCurrentWeatherByCoords(lat, lon) {
  const res = await fetch(`${API_BASE}/weather/current?lat=${lat}&lon=${lon}`);
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to fetch weather');
  return data;
}

export async function createRecord(payload) {
  const res = await fetch(`${API_BASE}/weather/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to create record');
  return data;
}

export async function getRecords() {
  const res = await fetch(`${API_BASE}/weather/records`);
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to fetch records');
  return data;
}

export async function updateRecord(id, payload) {
  const res = await fetch(`${API_BASE}/weather/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to update record');
  return data;
}

export async function deleteRecord(id) {
  const res = await fetch(`${API_BASE}/weather/records/${id}`, { method: 'DELETE' });
  const data = await parseResponse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to delete record');
  return data;
}

export function getExportUrl(format) {
  return `${API_BASE}/export/${format}`;
}
