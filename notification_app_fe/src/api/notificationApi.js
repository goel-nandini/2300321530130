// notificationApi.js
// Fetch notifications from a provided API.

const DEFAULT_API_URL = process.env.NOTIFICATION_API_URL;

async function fetchNotifications({ apiUrl = DEFAULT_API_URL, fetchImpl = fetch } = {}) {
  if (!apiUrl) {
    throw new Error('Missing NOTIFICATION_API_URL env var (or pass apiUrl to fetchNotifications).');
  }

  const res = await fetchImpl(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Notification API error: ${res.status} ${res.statusText} ${text}`.trim());
  }

  const data = await res.json();

  // Accept a couple common shapes:
  // - { notifications: [...] }
  // - { items: [...] }
  // - [...]
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.notifications)) return data.notifications;
  if (Array.isArray(data.items)) return data.items;

  return [];
}

export { fetchNotifications };

