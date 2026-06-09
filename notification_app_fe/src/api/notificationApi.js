import { Log } from '../utils/logger.js';

const API_URL = 'http://4.224.186.213/evaluation-service/notifications';
const BEARER_TOKEN = 'PLACEHOLDER_TOKEN_BEARER';

/**
 * Fetches raw notifications from the external API.
 * @returns {Promise<Array>} List of notifications
 */
async function fetchNotifications() {
  try {
    Log('info', 'api', 'Fetching notifications from API');

    const res = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Notification API error: ${res.status} ${res.statusText} ${text}`.trim());
    }

    const data = await res.json();
    
    if (data && Array.isArray(data.notifications)) {
      return data.notifications;
    }
    
    return [];
  } catch (error) {
    Log('error', 'api', error.message);
    throw error;
  }
}

export { fetchNotifications };


