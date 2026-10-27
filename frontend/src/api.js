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

export async function shortenUrl(longUrl) {
  const res = await fetch(`${API_BASE}/api/shorten`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: longUrl }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Failed to shorten URL (status ${res.status})`);
  }

  return res.json();
}

export async function getUrlStats(shortCode) {
  const cleanCode = shortCode.trim().replace(/^.*\/r\//, '');
  const res = await fetch(`${API_BASE}/api/urls/${encodeURIComponent(cleanCode)}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Short link "${cleanCode}" not found.`);
    }
    const errorText = await res.text();
    throw new Error(errorText || `Failed to fetch stats (status ${res.status})`);
  }

  return res.json();
}
