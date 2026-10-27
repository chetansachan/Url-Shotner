const API_BASE = import.meta.env.VITE_API_URL || '';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/healthz`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return { status: 'healthy', message: text };
  } catch (err) {
    return { status: 'degraded', error: err.message };
  }
}
