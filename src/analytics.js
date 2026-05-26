/**
 * Homelab analytics API client — static-site friendly with offline fallback.
 */

const API_BASE =
  process.env.REACT_APP_API_BASE || 'https://cloud.amanthakkar.com';

const FALLBACK = {
  baseline: 2913,
  live: 0,
  total: 2913,
  sources: [],
  offline: true,
};

async function fetchJson(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function getVisitorCount() {
  try {
    return { ...(await fetchJson('/api/visitor-count')), offline: false };
  } catch {
    return { ...FALLBACK };
  }
}

export async function getStats() {
  try {
    return { ...(await fetchJson('/api/stats')), offline: false };
  } catch {
    return { ...FALLBACK };
  }
}

export async function recordNewVisitor(source) {
  const params = new URLSearchParams();
  if (source) params.set('source', source);
  const qs = params.toString();
  const path = `/api/new-visitor${qs ? `?${qs}` : ''}`;
  try {
    const data = await fetchJson(path);
    return {
      total: data.total ?? data.count ?? FALLBACK.total,
      recorded: data.recorded !== false,
      offline: false,
    };
  } catch {
    return { total: FALLBACK.total, recorded: false, offline: true };
  }
}

export async function recordReturningVisitor() {
  try {
    const data = await fetchJson('/api/visitor-count');
    return {
      total: data.total ?? FALLBACK.total,
      offline: false,
    };
  } catch {
    return { total: FALLBACK.total, offline: true };
  }
}
