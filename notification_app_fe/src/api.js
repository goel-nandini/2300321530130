const API_URL = 'http://4.224.186.213/evaluation-service/notifications';
const BEARER_TOKEN = 'PLACEHOLDER_TOKEN_BEARER';

/**
 * Fetches notifications from the API with query parameters.
 * @param {Object} params
 * @param {number} [params.limit]
 * @param {number} [params.page]
 * @param {string} [params.notification_type]
 * @returns {Promise<Object>} API Response
 */
export async function fetchNotifications({ limit, page, notification_type } = {}) {
  const url = new URL(API_URL);
  
  if (limit !== undefined) url.searchParams.append('limit', limit);
  if (page !== undefined) url.searchParams.append('page', page);
  if (notification_type) url.searchParams.append('notification_type', notification_type);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${errText || response.statusText}`);
  }

  return await response.json();
}
